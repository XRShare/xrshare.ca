# xrshare.ca

The public website for the XRShare app. It is plain static HTML/CSS/JS with no build step, served by GitHub Pages at <https://xrshare.ca>.

**App Store Connect points here.** The app's Privacy Policy, Support and Developer Website URLs all point to `https://xrshare.ca`. The home page therefore has to keep visible links to `/privacy/` and `/support/` and show a contact email. Do not remove the privacy/support section from the home page or the links in the header and footer without first changing those URLs in App Store Connect.

## Pages

| Path | Purpose |
|---|---|
| `/` (`index.html`) | Landing page: live 3D model viewer, how it works, iPhone and Vision Pro screenshots, privacy and support summary |
| `/privacy/` | Privacy policy. It must match the App Store privacy label ("Data Not Collected") and what the app actually does |
| `/support/` | Contact, requirements, FAQ |
| `404.html` | GitHub Pages not-found page |

## Editing

- **Preview locally:** run `python3 -m http.server 8000` in this folder and open <http://localhost:8000>. Paths are root-relative (`/assets/...`), so opening the files directly with `file://` will not work.
- **Deploy:** push to `main`. GitHub Pages rebuilds within a minute or two.
- **Support email:** it appears in `index.html`, `privacy/index.html` and `support/index.html`. Search for `ali.kara@xrshare.ca` to change all of them at once.
- **When the app's data handling changes** (new network calls, analytics, AI features, new data shared over SharePlay), update `privacy/index.html` and its effective date, and the App Store privacy label, **before** the release ships.

## Assets

- `assets/models/*.glb`: web versions of the app's built-in USDZ models, used by `<model-viewer>`. They were converted with `usd2gltf` and compressed with `gltf-transform optimize --compress draco --texture-compress webp --texture-size 1024`.
- `assets/models/*.usdz`: the original app models, used for AR Quick Look ("View in your room") on iPhone and iPad.
- `assets/img/iphone`, `assets/img/vision`: App Store screenshots, resized to WebP.
- `assets/img/badge-app-store-*.svg`: the official Apple badge from the Apple Marketing Tools. Do not modify it.

To add a demo video later, put an H.264 `.mp4` (under about 15 MB) in `assets/video/` and add a `<video autoplay muted loop playsinline>` block to `index.html`. Record it on a device; the Simulator cannot show AR.

## DNS

The domain is registered at GoDaddy. Email (Microsoft 365) also runs on this domain, so **only the website records were changed**:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `xrshare.github.io` |

Do not touch the MX, SPF (TXT), `autodiscover` or other Microsoft records.
