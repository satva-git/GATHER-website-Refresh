# Client link — use this now

Local IP links (e.g. `192.168.1.68`) only work on your Wi-Fi. Clients on the internet need a **public tunnel** or **Azure**.

## Stable public link (Azure — use for 30-day client review)

**Send this to your client:**

https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/?review=ade20793493210f2321bfbf8cc64278a

| Purpose | URL |
|--------|-----|
| Client review | https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/?review=ade20793493210f2321bfbf8cc64278a |
| Admin | https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/admin/ |

No VPN or client setup required. Your PC does not need to stay on.

## Fastest way to create a new public link

1. Double-click **`Share-Client-Now.bat`** in this folder (or run `npm run share`).
2. Wait ~30 seconds until you see: **`>>> SEND THIS LINK TO YOUR CLIENT <<<`**
3. Copy the `https://....trycloudflare.com` link and send it to your client.
4. **Leave the window open** for the full review period (5–6 days).

## Links that always work on your PC only

| Purpose | URL |
|--------|-----|
| Homepage + review | http://localhost:3000/?review=ade20793493210f2321bfbf8cc64278a |
| Admin | http://localhost:3000/admin/ |

## Do not share these with external clients

- `http://192.168.1.68:3000/...` — local network only
- `http://localhost:3000/...` — this PC only

## Temporary tunnel (if Azure is down)

Run `npm run share` or double-click `Share-Client-Now.bat` for an instant public link. Keep the window open; the URL changes if you restart the tunnel.
