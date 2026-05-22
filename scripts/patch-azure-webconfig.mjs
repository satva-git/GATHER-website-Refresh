import fs from 'fs';
import path from 'path';

const publishProfileXml = process.env.AZURE_WEBAPP_PUBLISH_PROFILE;
const deployWebConfig = path.join('deploy_pkg', 'web.config');

if (!publishProfileXml) {
  console.log('AZURE_WEBAPP_PUBLISH_PROFILE is not set; skipping web.config patch.');
  process.exit(0);
}

if (!fs.existsSync(deployWebConfig)) {
  console.log('deploy_pkg/web.config not found; skipping patch.');
  process.exit(0);
}

const profileMatch = publishProfileXml.match(
  /publishMethod="ZipDeploy"[^>]*publishUrl="([^"]+)"[^>]*userName="([^"]+)"[^>]*userPWD="([^"]+)"/
);

if (!profileMatch) {
  console.log('Zip Deploy profile not found; skipping web.config patch.');
  process.exit(0);
}

const [, publishUrl, userName, userPwd] = profileMatch;
const scmHost = publishUrl.replace(/:443$/, '');
const auth = Buffer.from(`${userName}:${userPwd}`).toString('base64');

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kudu command failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return String(data.Output || data.output || '');
}

function pickNodePath(output) {
  const lines = output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/\\node\.exe$/i.test(line)) return line;
  }

  for (const line of lines) {
    const versionDir = line.replace(/[\\/]+$/, '');
    if (/\\nodejs\\/i.test(versionDir)) {
      return path.win32.join(versionDir, 'node.exe');
    }
    if (/^\d+\.\d+\.\d+/.test(line)) {
      return `D:\\Program Files (x86)\\nodejs\\${line}\\node.exe`;
    }
  }

  return null;
}

const fallbackPaths = [
  'D:\\Program Files (x86)\\nodejs\\node.exe',
  'C:\\Program Files (x86)\\nodejs\\node.exe',
  'D:\\Program Files (x86)\\nodejs\\20.20.2\\node.exe',
  'C:\\Program Files (x86)\\nodejs\\20.20.2\\node.exe'
];

let nodePath = null;

try {
  const whereOutput = await kuduCommand('where node');
  nodePath = pickNodePath(whereOutput);
  if (nodePath) console.log('Resolved Node from Kudu where:', nodePath);
} catch (err) {
  console.log('Could not resolve Node via where:', err.message);
}

if (!nodePath) {
  try {
    const dirOutput = await kuduCommand('cmd /c dir /b "D:\\Program Files (x86)\\nodejs"');
    nodePath = pickNodePath(dirOutput);
    if (nodePath) console.log('Resolved Node from Kudu dir:', nodePath);
  } catch (err) {
    console.log('Could not resolve Node via dir:', err.message);
  }
}

if (!nodePath) {
  for (const candidate of fallbackPaths) {
    try {
      const probe = await kuduCommand(`cmd /c if exist "${candidate}" echo ${candidate}`);
      const resolved = pickNodePath(probe);
      if (resolved) {
        nodePath = resolved;
        console.log('Resolved Node via probe:', nodePath);
        break;
      }
    } catch (err) {
      // try next fallback
    }
  }
}

if (!nodePath) {
  console.log('Using start-azure.cmd launcher because Node path could not be resolved.');
  process.exit(0);
}

const xmlNodePath = nodePath.replace(/&/g, '&amp;');
let webConfig = fs.readFileSync(deployWebConfig, 'utf8');

webConfig = webConfig.replace(
  /processPath="[^"]*"/,
  `processPath="${xmlNodePath}"`
);
webConfig = webConfig.replace(
  /arguments="[^"]*"/,
  'arguments="server.js"'
);

fs.writeFileSync(deployWebConfig, webConfig, 'utf8');
console.log('Patched deploy_pkg/web.config to launch Node directly at', nodePath);
