import fs from 'fs';
import path from 'path';

const deployWebConfig = path.join('deploy_pkg', 'web.config');

if (!fs.existsSync(deployWebConfig)) {
  console.log('deploy_pkg/web.config not found; skipping patch.');
  process.exit(0);
}

let webConfig = fs.readFileSync(deployWebConfig, 'utf8');

webConfig = webConfig.replace(
  /processPath="[^"]*"/,
  'processPath="cmd.exe"'
);
webConfig = webConfig.replace(
  /arguments="[^"]*"/,
  'arguments="/c run.cmd"'
);

fs.writeFileSync(deployWebConfig, webConfig, 'utf8');
console.log('Patched deploy_pkg/web.config to launch via cmd.exe /c run.cmd');
