# Save One Game — PC Edition

Save one PC game from every year, 1980–2025, then see what share of players saved the same one.

## What's in here

| Path | What it is |
|---|---|
| `public/index.html` | The whole game (roster, box-art lookup, votes, saved-games screen) |
| `netlify/functions/votes.mjs` | The vote counter that runs on Netlify |
| `netlify/functions/ids.mjs` | List of valid games, so nobody can post junk votes |
| `netlify.toml`, `package.json` | Tell Netlify where things are and what to install |
| `source/` | Roster text file and build script, used for editing the game list (not needed to deploy) |

## Put it online (GitHub + Netlify, no command line)

Netlify's drag-and-drop deploy only serves plain files. It can't run the vote counter, so this has to go through GitHub.

1. **GitHub**: create a new repository (e.g. `save-one-game-pc`). On its page click **uploading an existing file** and drag in everything from this folder **except** `node_modules` (if present). Commit.
2. **Netlify**: **Add new project → Import an existing project → GitHub**, then pick the repository. Leave the build settings as they are; `netlify.toml` already sets them. Click **Deploy**.
3. Open the `*.netlify.app` address once the deploy finishes. Pick a game and you should see percentages.

To update the game later, upload the changed file to the GitHub repo. Netlify redeploys on its own.

Votes are stored in **Netlify Blobs** on your site, which is included in the free plan. Redeploying keeps them.

## Checking box art

Open `https://<your-site>/#covers`. It looks every game up on Wikipedia and lists the ones that fell back to a drawn box.

## Fixing a cover yourself

In `source/roster.txt`, every game is one line:

```
Title|Developer|Genre|Platform|Wikipedia article|Cover override
```

To force a specific image, set the last field to `file:` plus the Wikipedia file name (the part after `File:` in the image URL), for example:

```
Jagged Alliance|Madlab Software|Tactics|MS-DOS|Jagged Alliance (video game)|file:Jagged_Alliance_cover.png
```

or to `url:` plus a direct image link. Then run `python3 source/build.py` from the repo root and upload the new `public/index.html`. You can also just send the links to Claude.

## How the counting works

Each browser gets a random anonymous id. One vote per browser per year; changing your pick moves your vote instead of adding a second one. Clearing your picks with **Start over** does not delete the votes you already cast.
