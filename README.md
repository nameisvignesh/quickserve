# QuickServe

QuickServe is a responsive, dependency-light front-end prototype for a real-time home services marketplace.

Included service flows:

- Home cleaning
- AC service
- TV installation
- Appliance repair

## Run locally

From this folder, serve the files with any static server. For example:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

The booking drawer, full-page booking workspace, search, service filters, GPS/manual location flow, custom date/time pickers, local sign-in/sign-up, persisted bookings, and copyable ticket confirmation are implemented in plain JavaScript. The visual illustrations are CSS-built, so there are no image assets or build step required.
