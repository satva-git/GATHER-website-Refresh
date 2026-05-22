# Client link — use this now (Azure is not required)

Azure deploy has been unreliable. Use this **2-minute** method instead — full homepage + review comments + admin.

## Fastest way (double-click)

1. Double-click **`Share-Client-Now.bat`** in this folder.
2. Wait ~30 seconds until you see: **`>>> SEND THIS LINK TO YOUR CLIENT <<<`**
3. Copy that `https://....loca.lt` link and send it to your client.
4. **Leave the black window open** while they review.

## Or run from terminal

```bash
cd e:\Satva-Work\Howard\New-Website
npm install
npm run share
```

## Links that always work on your PC

| Purpose | URL |
|--------|-----|
| Homepage + review | http://localhost:3000/?review=ade20793493210f2321bfbf8cc64278a |
| Admin | http://localhost:3000/admin/ |

## Same Wi-Fi (no tunnel)

1. Run `npm run preview`
2. Run `ipconfig` → note your **IPv4** (e.g. `192.168.1.68`)
3. Share: `http://192.168.1.68:3000/?review=ade20793493210f2321bfbf8cc64278a`

## Azure link (when fixed)

https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/?review=ade20793493210f2321bfbf8cc64278a

Check GitHub Actions — deploy must pass **Verify live site health** before using Azure.
