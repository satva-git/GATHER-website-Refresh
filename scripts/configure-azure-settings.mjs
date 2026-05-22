const publishProfileXml = process.env.AZURE_WEBAPP_PUBLISH_PROFILE;
if (!publishProfileXml) {
  console.log('AZURE_WEBAPP_PUBLISH_PROFILE is not set; skipping Azure runtime settings.');
  process.exit(0);
}

const profileMatch = publishProfileXml.match(
  /publishMethod="ZipDeploy"[^>]*publishUrl="([^"]+)"[^>]*userName="([^"]+)"[^>]*userPWD="([^"]+)"/
);

if (!profileMatch) {
  console.log('Zip Deploy profile not found; skipping Azure runtime settings.');
  process.exit(0);
}

const [, publishUrl, userName, userPwd] = profileMatch;
const scmHost = publishUrl.replace(/:443$/, '');
const auth = Buffer.from(`${userName}:${userPwd}`).toString('base64');

const settings = [
  { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~20' },
  { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '0' },
  { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: 'true' },
  { name: 'WEBSITES_CONTAINER_START_TIME_LIMIT', value: '600' },
  { name: 'REVIEW_DATA_DIR', value: 'D:\\home\\site\\data' }
];

const res = await fetch(`https://${scmHost}/api/settings`, {
  method: 'PUT',
  headers: {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(settings)
});

if (!res.ok) {
  console.log(
    `Could not update Azure app settings (${res.status}). ` +
    'Node.js will still start via web.config on Windows App Service.'
  );
  process.exit(0);
}

console.log('Azure runtime settings updated.');
