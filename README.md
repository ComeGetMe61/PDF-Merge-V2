# PDF Merge V2

This project is a Vite + React TypeScript app configured to deploy to GitHub Pages.

## Quick deploy

1. Ensure `gh-pages` is installed (already added as a devDependency).
2. Set `base` in `vite.config.ts` to `/<REPO_NAME>/` (already set to `/PDF-Merge-V2/`).
3. Build and publish:

```powershell
npm run deploy
```

This runs `npm run build` then `gh-pages -d dist` to publish the `dist` folder.

## Notes

- If you host under a different repo name, update the `base` path in `vite.config.ts`.
- If your project uses environment variables (e.g., `GEMINI_API_KEY`), ensure they're available during build-time if needed.
- If GitHub Pages doesn't show the site immediately, check repository `Settings > Pages` and ensure the `gh-pages` branch is selected.
