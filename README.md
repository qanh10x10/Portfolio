# Hollow Portfolio — React

Live: https://portfolio.hollow-agent.xyz/

The existing portfolio is now rendered by React + Vite. Original profile and project content/styles are retained, including 16 cards, 19 detail sections and the five linked Unity WebGL demos. React, PixiJS, Cocos Creator and project-based Phaser experience are included without adding tenure claims. Existing career dates/years have not been rewritten.

Tabs use `/about`, `/resume`, `/portfolio`, `/contact`; project details use `/portfolio/<project-id>`. Browser Back/Forward and direct refresh preserve the selected view. Demo return links stay on the current origin and return to the matching project. Known routes serve the React shell; unknown routes and missing source/assets stay 404.

## Local development and checks

```sh
cd HollowGameArchive
npm ci --ignore-scripts
npm run dev
npm run build
npm test
cd ..
node test-server.mjs
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

Contact opens an email draft to `chuquanganh00@gmail.com`; it does **not** send email automatically. Browser SMTP credentials and unsolicited page-load webhooks were removed. Rotate any previously exposed SMTP password outside this repository; deletion does not remove it from old Git history.

Original portfolio template/style attribution remains in `HollowGameArchive/README.md`; package license remains ISC.
