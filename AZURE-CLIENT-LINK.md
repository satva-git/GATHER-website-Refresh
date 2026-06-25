# Azure client review link (30-day stable URL)

**Status (2026-05-22):** Deployments complete on GitHub Actions, but the live app returns **502 Bad Gateway**. Do **not** send the Azure link to clients until `/api/health` returns `{"ok":true,...}`.

## Link to send the client (once Azure is healthy)

https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/?review=ade20793493210f2321bfbf8cc64278a

Admin: https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/admin/

## Check the site is up

Open: https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/api/health

You should see JSON like `{"ok":true,...}`. If you see **502**, follow the steps below.

## GitHub deploy status

Workflow: https://github.com/DcDixit/Gather.nexus-new-website/actions

Recent runs **#26–#29 failed** at **Verify live site health** (Node process not starting on App Service). Zip deploy still uploads; the runtime is the failure.

## Fetch Azure startup logs (Kudu)

1. Azure Portal → **GATHER-Nexus-New-Refreshment-Site** → **Download publish profile**
2. In PowerShell:

```powershell
$env:AZURE_WEBAPP_PUBLISH_PROFILE = Get-Content -Raw -Path ".\GATHER-Nexus-New-Refreshment-Site.PublishSettings"
node scripts/azure-fetch-logs.mjs
```

3. Or Portal → **Log stream** while refreshing the site — look for `[run]`, `[startup]`, or `ERROR`.

## Actions required in Azure Portal (about 5 minutes)

1. Sign in to [Azure Portal](https://portal.azure.com).
2. Open **App Service** → **GATHER-Nexus-New-Refreshment-Site**.
3. **Overview** → click **Restart**, wait 2 minutes, test `/api/health` again.
4. **Monitoring** → **Log stream** — leave it open and refresh the site. Copy any red error lines (especially `[startup]` or `[run]`).
5. **Configuration** → **General settings**:
   - Stack: **Node** (not .NET)
   - Major version: **Node 20** (or LTS)
   - **Always on**: **On** (if your plan supports it)
6. **Configuration** → **Application settings** — confirm these exist:
   - `WEBSITE_NODE_DEFAULT_VERSION` = `~20`
   - `REVIEW_DATA_DIR` = `D:\home\site\data`
   - `PUBLIC_BASE_URL` = `https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net`
7. **Development Tools** → **Advanced Tools (Kudu)** → **Go** → **Debug console** → **CMD** → run:
   ```
   cd site\wwwroot
   dir node_modules\express
   node server.js
   ```
   If Node fails here, paste the error message.

## GitHub deploy status

Pushes to `main` run: https://github.com/DcDixit/Gather.nexus-new-website/actions

The workflow **Verify live site health** must pass before the Azure link is safe to share.

## Immediate fallback (today)

If Azure still shows 502, run on your PC:

```
npm run share
```

Or double-click **Share-Client-Now.bat**, and send the `https://....trycloudflare.com` link. Keep that window open while the client reviews.
