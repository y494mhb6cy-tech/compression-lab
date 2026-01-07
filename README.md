# Reality Compression Lab — Labor Signals

Synthetic labor-market signal dashboard built with Next.js, Tailwind CSS, and Recharts.

## Requirements

- Node.js 18+

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## Build for production

```bash
npm run build
```

The static export is written to the `out/` directory.

## Generate data

```bash
npm run generate:data
```

This regenerates the JSON payloads in `public/data`.

## Deploy to Netlify

- Build command: `npm run build`
- Publish directory: `out`

If you need to refresh the synthetic data before deploy, run `npm run generate:data` and commit the updated JSON files.
