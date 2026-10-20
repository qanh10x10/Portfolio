# Hollow Portfolio — React

Live: https://portfolio.hollow-agent.xyz/

The portfolio uses React + Vite with the approved split-stage layout and Poppins. It includes 17 project cards, 20 detail sections and five linked Unity WebGL demos, including Tinh Thien Ha 1 with locally served official imagery. The visible technology stack includes Unity, C#, C++, Lua, Cocos, TypeScript, React.js, PixiJS and Phaser without adding tenure claims. Existing career dates/years have not been rewritten.

Tabs use `/about`, `/resume`, `/portfolio`, `/contact`; project details use `/portfolio/<project-id>`. Browser Back/Forward and direct refresh preserve the selected view. Demo return links stay on the current origin and return to the matching project. Known routes serve the React shell; unknown routes and missing source/assets stay 404.

## Local development and checks

```sh
cd HollowGameArchive
pnpm install --frozen-lockfile --ignore-scripts
pnpm run dev
pnpm run build
pnpm run build:service
pnpm test
cd ..
node test-server.mjs
node test-contact.mjs # isolated mail CLI fixtures; does not send real email
PORT=29800 node server.mjs
```

The static origin binds only `127.0.0.1:29800`, serves built files from `HollowGameArchive/dist`, supports video byte ranges and denies repository/source/secret paths. The public directory allowlists media and the five linked games; old contact scripts, PHP endpoints and archive source are not published. Production assets are minified without source maps.

## Background deployment

```sh
sudo install -m 644 portfolio.service /etc/systemd/system/portfolio.service
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio.service
```

Cloudflare's existing route maps `portfolio.hollow-agent.xyz` to `http://localhost:29800`. No new tunnel/token is needed, and no tunnel or router restart is required. To deploy a later edit, build/test the frontend and restart **only** `portfolio.service` if the static server changes. No automated Git polling was added.

Contact submits to exact same-origin `POST /api/contact` and sends directly to `chuquanganh00@gmail.com` through the existing `/home/opc/.local/bin/himalaya` account `primary`. From/To are fixed; the validated visitor email becomes Reply-To. The service user must be able to read its private Himalaya configuration; never copy credentials into this repository or frontend. The endpoint validates Origin, JSON fields and a 12KiB body limit, with single-instance limits of 3 send attempts/IP per 15 minutes, 20/hour globally and 2 concurrent sends. Delivery errors retain the form and do not trigger automatic retries. Fixture tests do not prove SMTP delivery; verify an explicitly approved test by its unique marker in the real mailbox. Browser SMTP credentials and unsolicited page-load webhooks remain removed; rotate any historically exposed password outside this repository.

Original portfolio template/style attribution remains in `HollowGameArchive/README.md`; package license remains ISC.
