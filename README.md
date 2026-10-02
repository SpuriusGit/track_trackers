# vibeindex

A tongue-in-cheek catalog of the same indie project ideas, counted across public GitHub repositories. Browse six familiar genres, inspect popular repositories, or search GitHub for another idea. The 3D chart scales each category by its live repository count and lets you select a genre.

The interface is available in English and Ukrainian. English is the default; the selected language is saved in the browser.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Check and build

```sh
npm run lint
npm run build
npm run preview
```

## Data and limitations

The app calls the public GitHub Repository Search API directly from the browser. Each category uses an English search query and shows the total number of matches plus up to six of the most-starred repositories. Results are cached in the current tab for 60 seconds. Manual refreshes and custom searches share GitHub's anonymous API rate limits.

Counts are approximate: GitHub Search does not index every repository, query wording affects results, and totals can change. Anonymous search has a strict rate limit, so some categories may be temporarily unavailable. A server-side proxy can use an authenticated token if higher request limits are needed; never expose that token in client-side code.
