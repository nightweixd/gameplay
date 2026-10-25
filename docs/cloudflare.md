# Deploy on Cloudflare

[Project home](../README.md) · [Project guide](README.md)

The repository builds to a static site. No database, API keys or environment variables are required.

## Workers Static Assets

The repository includes [wrangler.jsonc](../wrangler.jsonc) for a static-assets-only Worker named `gameplay`. It serves `dist/` and uses the single-page application fallback for game routes. It has no application server code, database bindings or Python execution on Cloudflare. Python runs on the visitor's device.

For a Git-connected Worker, use:

| Setting         | Value                              |
| --------------- | ---------------------------------- |
| Repository      | `nightweixd/gameplay`              |
| Root directory  | Repository root                    |
| Build command   | `npm run build`                    |
| Deploy command  | `npx wrangler deploy`              |
| Node.js version | `22`, specified in `.node-version` |

Keep the existing custom domain attached to the Worker. New commits to the configured production branch build and deploy through Workers Builds. Repository validation uses `npm run check:cloudflare` to perform a dry run without publishing.

The config preserves the existing compatibility date. No extra compatibility flags, bindings or runtime secrets are required for this static-only project. If deploying a separate copy, choose its Worker name deliberately before deploying; do not accidentally overwrite another project.

## Cloudflare Pages alternative

The same `dist/` output can also be hosted on Pages. There is no need to move an existing Worker-hosted site to Pages.

### Connect the repository

1. Open **Workers & Pages → Create application → Pages** in the Cloudflare dashboard.
2. Choose **Import an existing Git repository** and authorize GitHub access.
3. Select `nightweixd/gameplay` and use these settings:

| Setting                | Value                                         |
| ---------------------- | --------------------------------------------- |
| Production branch      | `main`                                        |
| Framework preset       | React (Vite), or None with the settings below |
| Root directory         | Repository root; leave blank                  |
| Build command          | `npm run build`                               |
| Build output directory | `dist`                                        |
| Node.js version        | `22`, specified in `.node-version`            |

4. Save and deploy. Open the generated `pages.dev` address to test the welcome screen and Minecraft.

If the setup requires a **deploy command**, you are in the Workers deployment flow; use the Workers settings above instead.

## Add a custom domain

Open the Pages project's **Custom domains → Set up a domain**, enter the desired subdomain, and follow the DNS instructions. When Cloudflare manages the DNS zone, it can add the record automatically. For external DNS, add the CNAME Cloudflare provides **after** registering the domain in the Pages project. You do not need to move other subdomains to this project.

## Routing and updates

Cloudflare Pages' single-page application fallback serves direct links such as `/games/minecraft`. Keep the build without a top-level `404.html`. Future pushes to the configured production branch trigger builds when automatic Git deployments are enabled.

## Troubleshooting

- **Build fails:** inspect the first error in the build log; confirm Node 22.12+ and the repository-root build directory. Run `npm ci` and `npm run check` locally.
- **Blank page:** confirm the output directory is `dist`, not `src` or the repository root. Check the browser console for missing assets.
- **World cannot start:** use a WebGL-capable desktop browser with hardware acceleration enabled.
- **Custom domain is pending:** confirm the domain was added inside Pages and that its DNS record matches the target supplied by Cloudflare.

Official references: [React on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [serving Pages and SPA routing](https://developers.cloudflare.com/pages/configuration/serving-pages/).

Workers references: [Static Assets](https://developers.cloudflare.com/workers/static-assets/), [single-page applications](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/), [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).
