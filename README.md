# Chef2Chef Stock Engine

Real-time physical stock count and inventory management for Chef2Chef. Built as a Progressive Web App (PWA) that works offline and syncs live across all devices.

## Features

- **Live sync** across web, mobile, and Google Sheets via Firebase Realtime Database
- **Offline support** — changes queue locally and auto-sync when reconnected
- **Formula entry** — type expressions like `5+3-1` directly into stock fields
- **Mobile QWERTY keyboard** — custom keyboard optimised for fast item search
- **Expiry date tracking** per item
- **QuickBooks qty comparison** column
- **Admin system lock** — Steve can lock the app to prevent accidental edits
- **History log** — full change history with user attribution pulled from Google Sheets
- **Dark / Light mode**
- **Installable** as a home screen app (PWA)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (single file) |
| Realtime sync | Firebase Realtime Database |
| Master data | Google Sheets via Apps Script |
| Hosting | GitHub Pages / any static host |
| Auth | Username + SHA-256 hashed passwords (Web Crypto API) |

## How it works

1. On load, fetches all inventory items from Google Sheets (cached for 20 min)
2. Fetches latest stock quantities from Firebase
3. All edits write to Firebase first (instant sync to other devices), then queue a background update to Google Sheets
4. Offline edits are queued in localStorage and flushed when connection returns

## Usage

- **Search** — tap the search bar (mobile opens custom keyboard)
- **Enter stock** — tap the quantity or `＋` button; use the numpad or type a formula
- **Formula bar** — tap the `=formula` field to open the formula keyboard; drag the trackpad or use ◀▶ to move cursor
- **Expiry date** — tap `＋ EXP DATE` next to any item
- **History** — tap `📋 HISTORY` in the nav bar
- **Lock** (admin only) — tap the 🔓 button to lock/unlock all entries

## Deployment

No build step needed. Serve `index.html` from any static host or GitHub Pages.

The Google Apps Script URL is embedded in the file (`SHEETS_URL`). Update it if you redeploy the Apps Script.
