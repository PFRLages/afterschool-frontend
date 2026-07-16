# After School Classes — Frontend (Vue.js)

A single-page web app for booking after-school classes and activities, built with **Vue.js 2** (via CDN) and **Bootstrap 5**.

## Features
- Displays all lessons fetched from the Express.js REST API
- Sort by subject, location, price or spaces (ascending/descending)
- Full-text search as you type (server-side search)
- Shopping cart with grouped items, quantities and live total
- Remove items one at a time or all at once
- Checkout form with validation (name: letters only, phone: numbers only)
- Orders saved to MongoDB Atlas; lesson spaces updated after checkout
- Loading state while the backend wakes up, and fallback icons if an image fails to load

## How to run locally
1. Clone this repository
2. Open `index.html` in a browser (or use the VS Code Live Server extension)
3. The app talks to the live backend by default (see `apiUrl` in `script.js`)

## Credits
Lesson icons generated with an AI image tool specifically for this project.