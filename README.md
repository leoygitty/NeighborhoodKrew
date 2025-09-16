# Neighborhood Krew Inc — Demo (Vite + React + Tailwind)

This is a **standalone** version of your demo site.

## Local preview
```bash
npm install
npm run dev
```

## Push to your repo
Repo: `https://github.com/leoygitty/NeighborhoodKrew.git`

```bash
# if the repo is empty:
git clone https://github.com/leoygitty/NeighborhoodKrew.git
cd NeighborhoodKrew
# copy all files from this folder into the repo folder, then:
git add .
git commit -m "Initial demo site"
git push origin main
```

## One-click deploy options

### Vercel (recommended)
1) Go to vercel.com and **Import Project** from GitHub: `leoygitty/NeighborhoodKrew`  
2) Build command: `npm run build` — Output: `dist` (already auto-detected)  
3) Click **Deploy**. Done.

### Netlify
1) app.netlify.com → Add new site → Import from Git.  
2) Build: `npm run build`, Publish: `dist`.  
3) Deploy.

### GitHub Pages
- A workflow is included at `.github/workflows/pages.yml`.  
- In GitHub: **Settings → Pages → Source: GitHub Actions**.  
- Push to `main`, the site will publish automatically.