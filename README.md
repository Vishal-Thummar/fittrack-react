# FitTrack (React + Tailwind)

## Run
```
npm install
cp .env.example .env     # then fill VITE_GOOGLE_CLIENT_ID and VITE_ALLOWED_EMAIL
npm run dev              # http://localhost:8000
```
Leave the Client ID empty for demo mode (saved in this browser only).
Google Cloud: enable Drive API, add your Gmail as Test user, and add `http://localhost:8000` as an Authorized JavaScript origin (same steps as before).
After editing `.env`, restart `npm run dev`.

## Build / host
`npm run build` → upload the `dist/` folder to Netlify / GitHub Pages / Firebase. Add that URL to the OAuth origins.
For hosting, set the two VITE_ variables in the host's environment settings.

## Structure
- `src/components/ui.jsx` Button, Card, Title, Input, ProgressBar, Stat, Segmented, Toast (reusable)
- `src/components/` ExerciseRow, DriveImage, MonthCalendar, Layout (top nav on desktop, bottom tab bar on mobile)
- `src/pages/` Login, Today, Timeline, Plan, Goals
- `src/context/AppContext.jsx` state, auto-save, sign-in
- `src/lib/` drive.js (Google auth + Drive), habit.js (streak/progress logic), defaultPlan.js (your chart)
