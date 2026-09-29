# xrshare.ca

The public website for the XRShare app. It is plain static HTML/CSS/JS with no build step, served by GitHub Pages at <https://xrshare.ca>.

**App Store Connect points here.** The app's Privacy Policy, Support and Developer Website URLs all point to `https://xrshare.ca`. The home page therefore has to keep visible links to `/privacy/` and `/support/` and show a contact email. Do not remove the privacy/support section from the home page or the links in the header and footer without first changing those URLs in App Store Connect.

## Pages

| Path | Purpose |
|---|---|
| `/` (`index.html`) | Landing page: 3D specimen plate, proof image, how it works (steps beside a sticky phone), Vision Pro, what you can do, privacy and support summary |
| `/privacy/` | Privacy policy. It must match the App Store privacy label ("Data Not Collected") and what the app actually does |
| `/support/` | Contact, requirements, FAQ |
| `404.html` | GitHub Pages not-found page |

## Editing

- **Preview locally:** run `python3 -m http.server 8000` in this folder and open <http://localhost:8000>. Paths are root-relative (`/assets/...`), so opening the files directly with `file://` will not work.
- **Deploy:** push to `main`. GitHub Pages rebuilds within a minute or two. Browsers cache CSS/JS for 10 minutes, so when you change `site.css` or `site.js`, bump the `?v=` stamp on their `<link>`/`<script>` tags in all four HTML files (any new value works; the short commit hash is convenient).
- **Support email:** it appears in `index.html`, `privacy/index.html` and `support/index.html`. Search for `ali.kara@xrshare.ca` to change all of them at once.
- **When the app's data handling changes** (new network calls, analytics, AI features, new data shared over SharePlay), update `privacy/index.html` and its effective date, and the App Store privacy label, **before** the release ships.

## Design rules

These keep the site from drifting back into a template look (from the September 2026 design review):

- The red italic accent appears **once**, in the hero headline. Other headings are plain ink.
- No numbered section labels. Mono "plate" captions are for figures and screenshots only.
- Each fact is stated once: SharePlay over FaceTime (hero and how it works), "free, no account, no tracking" (hero facts), your own USDZ files (what you can do).
- Small red text uses `--signal-text` (#a82b20), not `--signal`, to pass WCAG AA.
- Everything is served from this domain: fonts, the 3D viewer and its Draco decoder are vendored, so the privacy page can say the site makes no third-party requests.

## Assets

- `assets/models/*.glb`: web versions of the app's built-in USDZ models, used by `<model-viewer>`. They were converted with `usd2gltf` and compressed with `gltf-transform optimize --compress draco --texture-compress webp --texture-size 1024`.
- `assets/models/*.usdz`: the original app models, used for AR Quick Look ("View in your room") on iPhone and iPad.
- `assets/img/poster-skin.webp`: a transparent render of the skin model at the hero camera (`35deg 72deg 135%`, 30° field of view), shown until the 3D model loads. Re-render it if the hero framing changes.
- Atlas labels on the skin model are `model-viewer` hotspots with fixed `data-position` values; leader lengths are `--k` (a percentage of the plate width).
- `assets/img/proof/`: the "same model, same place" image (two iPhones in one session). Replace with a real photo or video of people when available (see the comment in `index.html`).
- `assets/img/screens/`: raw iPhone screens for the how-it-works steps (600px wide, no captions or frames).
- `assets/img/vision/`: Apple Vision Pro screens (1600px) and their thumbnails (`thumb-*.webp`, 320x200).
- `assets/img/rows/`: 240px square thumbnails for the "what you can do" rows.
- `assets/img/og.png`: the 1200x630 share card. `favicon.svg` is drawn for small sizes; `favicon.ico` and `favicon-32.png` are exported from it.
- `assets/fonts/`: Newsreader, Hanken Grotesk and IBM Plex Mono (SIL Open Font License), latin subsets.
- `assets/vendor/`: `model-viewer.min.js` 4.3.1 and the Draco 1.5.6 decoder.
- `assets/img/badge-app-store-*.svg`: the official Apple badge from the Apple Marketing Tools. Do not modify it, and keep clear space around it.

To add a demo video later, put an H.264 `.mp4` (under about 15 MB) in `assets/video/` and use it in the proof section. Record it on a device; the Simulator cannot show AR.

## DNS

The domain is registered at GoDaddy. Email (Microsoft 365) also runs on this domain, so **only the website records were changed**:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| CNAME | `www` | `xrshare.github.io` |

Do not touch the MX, SPF (TXT), `autodiscover` or other Microsoft records. GoDaddy asks for an SMS code on every DNS save.
