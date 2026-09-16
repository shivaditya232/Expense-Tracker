# Expense Tracker

A desktop expense tracker for logging daily spending, setting per-category monthly budgets and seeing where the money went. Built with Electron and plain JavaScript — no framework.

## Features

- **Log expenses** by amount, category and date
- **Monthly view** — step back and forward through months; every screen reflects the selected month
- **Eight categories** — Food, Transport, Education, Beauty, Shopping, Entertainment, Health and Others, each with its own colour
- **Budgets** — set a monthly budget per category and track spending against it
- **Stats** — category breakdown rendered as a chart with Chart.js
- **Local storage** — data is saved in the browser's local storage, so it persists between sessions without a server or account

## Tech stack

| Layer | Used |
| --- | --- |
| Desktop shell | Electron |
| UI | HTML, CSS, vanilla JavaScript |
| Charts | Chart.js |
| Storage | `localStorage` |

## Project structure

```
main.js       Electron main process — creates the desktop window
index.html    All three screens (Add Expense, Stats, Budget)
app.js        Application logic — expenses, budgets, charts, month navigation
style.css     Styling
```

## Running it

The quickest way is to open `index.html` directly in a browser — the whole app runs client-side.

To run it as a desktop window instead:

```bash
npm install --save-dev electron
npx electron .
```
