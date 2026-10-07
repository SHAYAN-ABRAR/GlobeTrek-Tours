# Redesign verification

Verified on 2026-10-06 using Chromium and Playwright on Linux.

**24 browser checks passed.** No missing assets, external requests, or JavaScript errors during the core flows.

## Checks

1. Subpath load, self-hosted fonts, and three featured destinations.
2. All seven original destinations are accessible.
3. All experience filters return the correct journeys.
4. Combined search empty state and recovery.
5. Duration filter matches the short trip.
6. Destination, experience, and duration filters combine correctly.
7. Experience cards open the relevant filtered collection.
8. Seven itinerary dialogs contain sample routes and close with Escape.
9. Saving a trip updates all controls and survives reload.
10. Saved notebook removal and empty state.
11. Planner requires a destination and rejects past departures.
12. Personal plan is created with notes safely rendered as text.
13. Downloaded UTF-8 trip notebook has the chosen details and honest status.
14. Draft editing and local plan persistence.
15. Dialog keyboard focus is contained and restored on close.
16. Itinerary to planner transition selects the correct destination.
17. Mobile menu navigates and unlocks the page.
18. No page or itinerary overflow at eleven widths from 320 to 1920px; every search field remains available.
19. Reduced-motion setting disables decorative animation.
20. No external requests, missing assets, or JavaScript errors during core flows.
21. Original travel film loads only after play and is removed on close (embed request mocked).
22. Malformed saved data is ignored safely.
23. Blocked browser storage keeps saving and planning usable for the session.
24. Extracted index.html works directly without a build or web server.

## Viewports

320, 360, 390, 540, 768, 800, 801, 1024, 1280, 1440, 1920 pixels wide. No horizontal page or itinerary-dialog overflow at these sizes. All three search fields remain visible.

## Publishing package

- Prepared against `main` at `e31fd2db27d453d8538e7cf75b37edb8a0d1ba42`.
- `Publish-GlobeTrek.ps1` uses Windows PowerShell 5.1 syntax, with an explicit ZIP path and no `&&`.
- The helper creates a fresh clone and a new review branch. It checks the baseline before copying website files.
- `-Push` commits and uploads the review branch; merging remains a separate user action.
- No repository settings, remote files, or live deployment were changed while preparing the package.

## Limits

- Browser checks were run in Chromium, not every browser or physical device.
- The Windows publishing helper was reviewed but not executed on Windows in this environment.
- The original YouTube embed request was mocked in the browser check. Actual external video availability was not verified.
- No backend bookings, inventory, prices, payments, or email delivery are claimed or tested.
- The private GitHub Pages source setting could not be read with the available connector. The README gives the official branch-publishing setup.
