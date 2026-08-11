# Sound Box Hardware Dashboard

React dashboard using ONLY the GET API:
https://hardware-api-calls.onrender.com/api/gethardware-data

The frontend calls `/api/hardware`; the Vercel serverless function fetches the Render API server-side, avoiding browser CORS issues.

POST is intentionally not integrated.

Run:
npm install
npm run dev

Deploy this folder to Vercel.
