/**
 * Fetch recent Azure stdout / iisnode logs via Kudu (requires publish profile).
 * Usage: set AZURE_WEBAPP_PUBLISH_PROFILE=<xml> && node scripts/azure-fetch-logs.mjs
 */
import fs from 'fs';

const publishProfileXml = process.env.AZURE_WEBAPP_PUBLISH_PROFILE;
if (!publishProfileXml) {
  console.error('Set AZURE_WEBAPP_PUBLISH_PROFILE to the App Service publish profile XML.');
  process.exit(1);
}

const profileMatch = publishProfileXml.match(
  /publishMethod="ZipDeploy"[^>]*publishUrl="([^"]+)"[^>]*userName="([^"]+)"[^>]*userPWD="([^"]+)"/
);
if (!profileMatch) {
  console.error('Zip Deploy credentials not found in publish profile.');
  process.exit(1);
}

const [, publishUrl, userName, userPwd] = profileMatch;
const scmHost = publishUrl.replace(/:443$/, '');
const auth = Buffer.from(`${userName}:${userPwd}`).toString('base64');

async function kuduGet(path) {
  const res = await fetch(`https://${scmHost}${path}`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} (${res.status}): ${text.slice(0, 500)}`);
  return text;
}

async function kuduCommand(command) {
  const res = await fetch(`https://${scmHost}/api/command`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      'If-Match': '*'
    },
    body: JSON.stringify({ command, dir: 'site\\wwwroot' })
  });
  const data = await res.json();
  return String(data.Output || data.output || data.Error || data.error || '');
}

console.log('SCM host:', scmHost);
console.log('\n--- Node resolution ---');
for (const cmd of ['where node', 'cmd /c dir /b "D:\\Program Files (x86)\\nodejs"']) {
  try {
    console.log(`> ${cmd}`);
    console.log(await kuduCommand(cmd));
  } catch (err) {
    console.log('  error:', err.message);
  }
}

console.log('\n--- site/wwwroot ---');
try {
  console.log(await kuduCommand('cmd /c dir /b'));
} catch (err) {
  console.log('  error:', err.message);
}

console.log('\n--- LogFiles/stdout (latest) ---');
try {
  const listing = await kuduGet('/api/vfs/LogFiles/');
  console.log(listing.slice(0, 2000));
} catch (err) {
  console.log('  error:', err.message);
}

try {
  const stdout = await kuduGet('/api/vfs/LogFiles/stdout/');
  console.log(stdout.slice(0, 2000));
} catch (err) {
  console.log('  stdout dir:', err.message);
}
