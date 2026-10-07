'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const trips = [
    {id:'maldives',name:'Maldives',kicker:'The art of doing less',tagline:'A little island. A whole lot of blue.',days:5,style:'coast',mood:'Slow & coastal',image:'maldives-900.webp',small:'maldives-480.webp',alt:'AI-created impression of an ivory sandbank in turquoise Maldivian waters',ai:true,description:'Imagine a few days measured in swims, sunsets, and the pages of a good book. This island-inspired outline leaves plenty of room to do wonderfully little.',route:[['Days 1–2','Find your island rhythm','Settle in, walk the shore, and watch the light change.'],['Days 3–4','Follow the blue','Leave space for a lagoon outing and a long, lazy afternoon.'],['Day 5','One more ocean morning','A slow breakfast, a last look, and the journey home.']]},
    {id:'kashmir',name:'Kashmir',kicker:'A higher kind of escape',tagline:'Where the mountains do the talking.',days:7,style:'mountain',mood:'Fresh air & open trails',image:'kashmir-900.webp',small:'kashmir-480.webp',alt:'AI-created impression of a pine-lined Kashmir valley beneath snowy peaks',ai:true,description:'An alpine daydream of pine-scented paths, wide valleys, and mornings worth waking up for. Build in time to pause, take in the view, and choose your own pace.',route:[['Days 1–2','Ease into the valley','Arrive, settle in, and explore at a gentle pace.'],['Days 3–5','Take the scenic path','Plan local walks and landscape days around conditions.'],['Days 6–7','Make room for quiet','A flexible day for your favorite view, then head home.']]},
    {id:'sri-lanka',name:'Sri Lanka',kicker:'Take the slow road',tagline:'Tea-country mornings. Ocean endings.',days:8,style:'culture',mood:'Culture & slow living',image:'sri-lanka-900.webp',small:'sri-lanka-480.webp',alt:'AI-created impression of sunlit tea terraces in the misty Sri Lankan highlands',ai:true,description:'A gentle mix of green hills, little discoveries, and time beside the sea. Use this outline as a starting point for a trip with more wandering and fewer checklists.',route:[['Days 1–2','A taste of somewhere new','Settle in and explore local food and neighborhood streets.'],['Days 3–5','Into the green','Leave time for the highlands, tea country, and slow walks.'],['Days 6–8','Let the coast take over','Finish with sea air and a little room to do nothing.']]},
    {id:'indonesia',name:'Indonesia',kicker:'Beyond the horizon',tagline:'More islands. More possibilities.',days:7,style:'coast',mood:'Islands & adventure',image:'indonesia-1200.webp',small:'indonesia-640.webp',alt:'AI-created impression of Indonesian ridgelines above crescent bays',ai:true,description:'A week imagined in sea blues and island greens. Start with one beautiful base, add a little adventure, and let the landscape set the tone.',route:[['Days 1–2','Touch down, slow down','Get your bearings and settle into an island base.'],['Days 3–5','Chase a different horizon','Plan a boat day or a local trail with a trusted operator.'],['Days 6–7','Keep one day open','Return to your favorite spot before the journey home.']]},
    {id:'bandarban',name:'Bandarban',kicker:'Closer to home',tagline:'River mornings. A softer pace.',days:3,style:'mountain',mood:'Hills & quiet moments',image:'bandarban-1200.webp',small:'bandarban-640.webp',alt:'AI-created impression of a small wooden boat on a forest-lined Bandarban river',ai:true,description:'A short escape imagined around soft morning light, forested hills, and the rhythm of the river. Keep this outline flexible and confirm local access before making plans.',route:[['Day 1','Trade the noise for green','Arrive, settle in, and take a gentle local walk.'],['Day 2','Let the river lead','Explore a locally approved river or hillside route.'],['Day 3','Take the feeling home','An unhurried morning and a little time to reflect.']]},
    {id:'bangladesh',name:'Bangladesh',kicker:'A fresh look at the familiar',tagline:'Small discoveries. Lasting stories.',days:6,style:'culture',mood:'Culture & connection',image:'bangladesh.webp',small:'bangladesh.webp',alt:'Green landscapes from the original GlobeTrek Bangladesh collection',ai:false,description:'An invitation to see familiar places with fresh eyes. Shape a personal route around green spaces, local flavors, and the everyday moments that make a journey yours.',route:[['Days 1–2','Find your starting point','Choose a base and get to know the neighborhood.'],['Days 3–4','Follow your curiosity','Build in a landscape day and time for local discoveries.'],['Days 5–6','Stay a little longer','Revisit what you loved, then make your way home.']]},
    {id:'north-america',name:'North America',kicker:'The great wide open',tagline:'Big landscapes. Bigger daydreams.',days:10,style:'mountain',mood:'Nature & open roads',image:'north-america.webp',small:'north-america.webp',alt:'Mountain scenery from the original GlobeTrek North America collection',ai:false,description:'A broad canvas for an outdoor escape. Choose one region, leave generous travel time, and build your days around landscapes you want to linger in.',route:[['Days 1–3','Choose your corner of the map','Arrive in your chosen region and settle into a base.'],['Days 4–7','Follow the open road','Explore a few nearby landscapes without rushing.'],['Days 8–10','Leave room for the unexpected','Keep a flexible day, then begin the journey home.']]}
  ];
  const findTrip = id => trips.find(t => t.id === id);
  const storageKeys = {saved:'globetrek-saved-v1',plan:'globetrek-plan-v1'};
  let storageAvailable = true;
  const readStorage = (key, fallback) => {try {const value = localStorage.getItem(key);return value ? JSON.parse(value) : fallback;} catch {return fallback;}};
  try {localStorage.setItem('globetrek-storage-check','1');localStorage.removeItem('globetrek-storage-check');} catch {storageAvailable = false;}
  const writeStorage = (key, value) => {try {localStorage.setItem(key, JSON.stringify(value));return true;} catch {storageAvailable = false;return false;}};
  const rawSaved = readStorage(storageKeys.saved, []);
  const saved = new Set(Array.isArray(rawSaved) ? rawSaved.filter(id => findTrip(id)) : []);
  let filter = {destination:'all', style:'all', duration:'all', expanded:false};
  let currentPlan = null;
  let toastTimer;
  const toast = $('#toast');
  function announce(message) {
    clearTimeout(toastTimer);
    const host = $('dialog[open]') || document.body;
    host.append(toast);toast.textContent = message;toast.hidden = false;
    toastTimer = setTimeout(() => {toast.hidden = true;}, 3500);
  }
  const scrollToCollection = () => {$('#destinations-title').focus({preventScroll:true});$('#destinations').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};
  const styleLabels = {all:'All escapes',coast:'Coast & islands',mountain:'Mountains & trails',culture:'Culture & slow living'};
  const durationLabels = {all:'Any duration',short:'Up to 4 days',week:'5–7 days',long:'8+ days'};
  function matchesDuration(days) {return filter.duration === 'all' || (filter.duration === 'short' && days <= 4) || (filter.duration === 'week' && days >= 5 && days <= 7) || (filter.duration === 'long' && days >= 8);}
  function renderCollection() {
    const matches = trips.filter(t => (filter.destination === 'all' || t.id === filter.destination) && (filter.style === 'all' || t.style === filter.style) && matchesDuration(t.days));
    const filtered = filter.destination !== 'all' || filter.style !== 'all' || filter.duration !== 'all';
    const visible = !filter.expanded && !filtered ? matches.slice(0,3) : matches;
    $('#destination-grid').innerHTML = visible.map((t,i) => `<article class="destination-card ${visible.length>3 && i>2?'compact':''} reveal-item" style="animation-delay:${Math.min(i,3)*55}ms"><div class="card-image"><img src="assets/images/${t.small}" ${t.small !== t.image ? `srcset="assets/images/${t.small} ${['indonesia','bandarban'].includes(t.id)?640:480}w, assets/images/${t.image} ${['indonesia','bandarban'].includes(t.id)?1200:900}w" sizes="(max-width: 540px) calc(100vw - 40px), (max-width: 800px) 45vw, 32vw"`:''} alt="${t.alt}" loading="lazy" decoding="async" width="900" height="1200"><span class="card-number">${String(trips.indexOf(t)+1).padStart(2,'0')} / 07</span><button class="destination-link" data-trip="${t.id}" aria-label="Explore ${t.name}"><span class="destination-kicker">${t.kicker}</span><span class="destination-name">${t.name}</span></button><button class="save-button" data-save="${t.id}" aria-pressed="${saved.has(t.id)}" aria-label="${saved.has(t.id)?'Unsave':'Save'} ${t.name}">${icon('heart')}</button></div><div class="card-caption"><div><h3>${t.tagline}</h3><p>${t.days} days, imagined · ${t.mood}</p></div><button data-trip="${t.id}" aria-label="View ${t.name} itinerary">${icon('diagonal')}</button></div></article>`).join('');
    $('#empty-results').hidden = matches.length !== 0;
    $('#show-all').hidden = filter.expanded || filtered || matches.length <= 3;
    $('#result-count').textContent = filtered ? `${matches.length} ${matches.length===1?'escape':'escapes'} for your kind of day.` : `${visible.length} of 7 places to imagine.`;
    $$('.filter-chip').forEach(b => {const active = b.dataset.filter===filter.style;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $('#active-search').hidden = !filtered;
    $('#search-description').textContent = [findTrip(filter.destination)?.name,filter.style !== 'all' ? styleLabels[filter.style] : '',filter.duration !== 'all' ? durationLabels[filter.duration] : ''].filter(Boolean).join(' · ');
  }
  function resetFilters(expanded = true) {filter = {destination:'all',style:'all',duration:'all',expanded};$('#finder-form').reset();renderCollection();}
  $('#finder-form').addEventListener('submit', e => {e.preventDefault();filter={destination:$('#find-destination').value,style:$('#find-style').value,duration:$('#find-duration').value,expanded:true};renderCollection();scrollToCollection();});
  $$('.filter-chip').forEach(button => button.addEventListener('click', () => {filter = {destination:'all',style:button.dataset.filter,duration:'all',expanded:true};$('#finder-form').reset();$('#find-style').value=filter.style;renderCollection();$(`[data-filter="${filter.style}"]`).focus({preventScroll:true});}));
  $('#show-all').addEventListener('click', () => {filter.expanded=true;renderCollection();const firstNew=$$('.destination-link')[3];firstNew?.focus({preventScroll:true});firstNew?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});});
  $('#clear-search').addEventListener('click', () => {resetFilters();scrollToCollection();});
  $('#reset-search').addEventListener('click', () => {resetFilters();scrollToCollection();});
  $$('[data-experience]').forEach(button => button.addEventListener('click', () => {filter={destination:'all',style:button.dataset.experience,duration:'all',expanded:true};$('#finder-form').reset();$('#find-style').value=filter.style;renderCollection();scrollToCollection();}));
  function openDialog(dialog) {$$('dialog[open]').forEach(d=>d.close());dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;}
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const controls = $$('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])',dialog).filter(el => !el.disabled && el.getClientRects().length);
      const first = controls[0], last = controls[controls.length-1];
      if (!first) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('click', e => {const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
    dialog.addEventListener('close', () => {if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');if(dialog.contains(toast)){toast.hidden=true;document.body.append(toast);}if(dialog.id==='film-dialog')$('#film-frame').replaceChildren();});
  });
  document.addEventListener('click', e => {
    const close=e.target.closest('[data-close]');if(close)close.closest('dialog').close();
    const tripButton=e.target.closest('[data-trip]');if(tripButton)openTrip(tripButton.dataset.trip);
    const saveButton=e.target.closest('[data-save]');if(saveButton)toggleSave(saveButton.dataset.save);
    const savedButton=e.target.closest('[data-open-saved]');if(savedButton){renderSaved();openDialog($('#saved-dialog'));}
    const planButton=e.target.closest('[data-plan]');if(planButton)openPlanner(planButton.dataset.plan);
  });
  $('#menu-toggle').addEventListener('click', () => openDialog($('#menu-dialog')));
  $$('#menu-dialog nav a').forEach(a=>a.addEventListener('click',()=>$('#menu-dialog').close()));
  function syncSavedUI() {
    $$('.saved-count').forEach(e=>e.textContent=saved.size);
    $$('.saved-trigger').forEach(b=>b.setAttribute('aria-label',`Saved trips, ${saved.size} saved`));
    $$('[data-save]').forEach(button => {const t=findTrip(button.dataset.save);if(!t)return;const active=saved.has(t.id);button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',`${active?'Unsave':'Save'} ${t.name}`);});
  }
  function toggleSave(id) {const t=findTrip(id);if(!t)return;const removed=saved.delete(id);if(!removed)saved.add(id);const persisted=writeStorage(storageKeys.saved,[...saved]);syncSavedUI();if($('#saved-dialog').open){renderSaved();$('#saved-title').setAttribute('tabindex','-1');$('#saved-title').focus({preventScroll:true});}announce(removed?`${t.name} removed from your notebook.`:`${t.name} saved${persisted?' to your notebook.':' for this visit. Browser storage is unavailable.'}`);}
  function renderSaved() {
    $('#saved-description').textContent=storageAvailable?'Keep the places that call to you. Saved in this browser.':'Your browser is blocking storage. These saves last for this visit.';
    $('#saved-list').innerHTML = saved.size ? trips.filter(t=>saved.has(t.id)).map(t=>`<div class="saved-item"><img src="assets/images/${t.small}" alt="" width="68" height="78"><div class="saved-item-info"><h3>${t.name}</h3><p>${t.days} days, imagined · ${t.mood}</p></div><button data-trip="${t.id}" aria-label="View ${t.name} itinerary">${icon('diagonal')}</button><button data-save="${t.id}" aria-pressed="true" aria-label="Unsave ${t.name}">${icon('close')}</button></div>`).join(''):`<div class="notebook-empty"><svg class="empty-icon" aria-hidden="true"><use href="#i-compass"/></svg><h3>Every adventure starts with a maybe.</h3><p>Tap a heart on any destination to keep it here.</p></div>`;
  }
  $('#browse-from-saved').addEventListener('click',()=>{$('#saved-dialog').close();scrollToCollection();});
  const itineraryHTML = t => `<ol class="itinerary">${t.route.map(r=>`<li><span>${r[0]}</span><div><strong>${r[1]}</strong><small>${r[2]}</small></div></li>`).join('')}</ol>`;
  function openTrip(id) {const t=findTrip(id);if(!t)return;$('#trip-content').innerHTML=`<div class="trip-layout"><div class="trip-visual"><img src="assets/images/${t.image}" alt="${t.alt}"><span>${t.ai?'AI-generated destination impression':'From the original GlobeTrek collection'}</span></div><div class="trip-details"><p class="eyebrow">${t.kicker} / Sample journey</p><h2 id="trip-title">${t.name.toUpperCase()}</h2><p class="trip-tagline">${t.tagline}</p><div class="trip-facts"><span>${t.days} days, imagined</span><span>${t.mood}</span></div><p class="trip-description">${t.description}</p><h3 class="itinerary-heading">A possible rhythm for your journey</h3>${itineraryHTML(t)}<div class="trip-actions"><button class="button button-dark" data-plan="${t.id}">Make this trip mine ${icon('arrow')}</button><button class="trip-save" data-save="${t.id}" aria-pressed="${saved.has(t.id)}" aria-label="${saved.has(t.id)?'Unsave':'Save'} ${t.name}">${icon('heart')}</button></div><p class="demo-note">An inspiration outline, not a bookable tour. Routes, access, activities, availability, and costs need independent confirmation.</p></div></div>`;openDialog($('#trip-dialog'));}
  function localToday() {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  const validDate=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00');return Number.isFinite(d.getTime())&&d.getFullYear()===Number(value.slice(0,4))&&d.getMonth()+1===Number(value.slice(5,7))&&d.getDate()===Number(value.slice(8,10));};
  const validPlan = p => p && typeof p==='object' && findTrip(p.destination) && [1,2,3,4,5,6].includes(Number(p.travelers)) && ['Unhurried','Balanced','Adventurous'].includes(p.pace) && (p.date===''||validDate(p.date)) && typeof p.notes==='string' && p.notes.length<=500;
  function openPlanner(id) {
    $('#planner-form').hidden=false;$('#plan-result').hidden=true;
    const prior=currentPlan||readStorage(storageKeys.plan,null);
    if(validPlan(prior)){$('#plan-destination').value=prior.destination;$('#plan-date').value=prior.date>=localToday()?prior.date:'';$('#plan-travelers').value=String(prior.travelers);$('#plan-pace').value=prior.pace;$('#plan-notes').value=prior.notes;}
    if(findTrip(id))$('#plan-destination').value=id;
    $('#plan-date').min=localToday();
    $('#planner-form .form-footnote').textContent=storageAvailable?'Your plan stays on this device. No personal details needed.':'Browser storage is unavailable. You can still download your plan.';
    openDialog($('#planner-dialog'));
  }
  const dateLabel = value => value && validDate(value) ? new Intl.DateTimeFormat('en',{month:'long',day:'numeric',year:'numeric'}).format(new Date(value+'T12:00:00')) : 'Dates open';
  $('#planner-form').addEventListener('submit', e=>{e.preventDefault();$('#plan-date').min=localToday();if(!$('#planner-form').reportValidity())return;const p={destination:$('#plan-destination').value,date:$('#plan-date').value,travelers:Number($('#plan-travelers').value),pace:$('#plan-pace').value,notes:$('#plan-notes').value.trim()};if(!validPlan(p))return;currentPlan=p;const persisted=writeStorage(storageKeys.plan,p);const t=findTrip(p.destination);$('#plan-save-status').textContent=persisted?'Your plan is ready and saved on this device.':'Your plan is ready. Download it to keep a copy.';$('#plan-summary').innerHTML=`<img class="plan-cover" src="assets/images/${t.image}" alt="${t.alt}"><h3 class="plan-place">${t.name}</h3><p class="plan-meta"></p>${itineraryHTML(t)}<p class="plan-user-note" hidden></p>`;$('.plan-meta').textContent=`${dateLabel(p.date)} · ${t.days} days · ${p.travelers} ${p.travelers===1?'traveler':'travelers'} · ${p.pace}`;if(p.notes){$('.plan-user-note').hidden=false;$('.plan-user-note').textContent=p.notes;}$('#planner-form').hidden=true;$('#plan-result').hidden=false;$('#planner-dialog').scrollTop=0;$('#download-plan').focus({preventScroll:true});});
  $('#edit-plan').addEventListener('click',()=>{$('#planner-form').hidden=false;$('#plan-result').hidden=true;$('#plan-destination').focus();});
  $('#download-plan').addEventListener('click',()=>{if(!validPlan(currentPlan))return;const p=currentPlan,t=findTrip(p.destination);const content=[`GLOBETREK — YOUR ${t.name.toUpperCase()} TRIP NOTEBOOK`,'',t.tagline,`Departure: ${dateLabel(p.date)}`,`Duration: ${t.days} days (sample outline)`,`Travelers: ${p.travelers}`,`Pace: ${p.pace}`,'','A POSSIBLE RHYTHM',...t.route.flatMap(r=>[`${r[0]} — ${r[1]}`,r[2],'']),...(p.notes?['NOTE TO MY FUTURE SELF',p.notes,'']:[]),'This is a personal inspiration draft, not a booking or a confirmed itinerary.','No details have been sent to an agency. Confirm actual routes, access, entry requirements, activities, availability, and costs independently before traveling.','','GlobeTrek Tours — A project by Shayan Abrar'].join('\r\n');const blob=new Blob(['\uFEFF'+content],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`GlobeTrek-${t.id}-Trip-Plan.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);announce('Your trip plan is ready to keep.');});
  $('#open-film').addEventListener('click',()=>{$('#film-frame').innerHTML='<img src="assets/images/bandarban-1200.webp" alt=""><button class="button button-cream" id="load-film">Play film on YouTube <span aria-hidden="true">▶</span></button>';openDialog($('#film-dialog'));$('#load-film').addEventListener('click',()=>{const iframe=document.createElement('iframe');iframe.src='https://www.youtube-nocookie.com/embed/668nUCeBHyY?autoplay=1';iframe.title='GlobeTrek travel inspiration film';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';$('#film-frame').replaceChildren(iframe);$('#film-dialog [data-close]').focus();});});
  let pendingScroll=false;
  window.addEventListener('scroll',()=>{if(!pendingScroll){pendingScroll=true;requestAnimationFrame(()=>{$('#site-header').classList.toggle('scrolled',window.scrollY>130);pendingScroll=false;});}},{passive:true});
  $('#site-header').classList.toggle('scrolled',window.scrollY>130);
  $('#year').textContent=new Date().getFullYear();
  renderCollection();syncSavedUI();
})();
