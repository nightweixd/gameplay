# Deploy on Cloudflare Pages

[Project home](../README.md) · [Project guide](README.md)

The repository builds to a static site. No database, API keys or environment variables are required.

## Connect the repository

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

If the setup requires a **deploy command**, check that you selected Pages rather than the Workers deployment flow. The settings above are for Pages.

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
