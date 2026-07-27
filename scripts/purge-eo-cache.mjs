#!/usr/bin/env node
/**
 * purge-eo-cache.mjs
 *
 * Purges the EdgeOne (Tencent Cloud TEO) CDN cache for every managed site after
 * a deploy, so the CDN serves the freshly-built HTML instead of a stale cached
 * response. A stale HTML body (old build id) paired with a fresh
 * /api/build-info (new build id) previously triggered the
 * BuildVersionChecker infinite-reload loop — see src/components/BuildVersionChecker.tsx.
 *
 * Credentials are read from the environment and NEVER hard-coded:
 *   - process.env.EO_SECRET_ID
 *   - process.env.EO_SECRET_KEY
 *
 * Run with: `npm run purge:cache`
 *
 * The script exits non-zero if credentials are missing or any purge task
 * fails, so it can be safely chained right after `pm2 restart` in the deploy
 * flow (the deploy aborts rather than shipping with a stale cache).
 */

import tencentcloud from 'tencentcloud-sdk-nodejs-teo';

const { teo } = tencentcloud;
const TeoClient = teo.v20220901.Client;

const REGION = 'ap-guangzhou';
const ENDPOINT = 'teo.tencentcloudapi.com';
const PURGE_TYPE = 'purge_prefix';

/**
 * Sites to purge. zone + domain are fixed constants; only the API credentials
 * are environment-driven. Each site purges both the apex host and the www host
 * by prefix.
 */
const SITES = [
  {
    name: 'qtechvending',
    zoneId: 'zone-3h9p5uedvs0a',
    domain: 'qtechvending.com',
  },
  {
    name: 'smart-cabinet',
    zoneId: 'zone-3sbdkmn9rdsy',
    domain: 'wstoolcabinet.com',
  },
];

/**
 * Builds the prefix targets for a domain: both apex and www, with https.
 * @param {string} domain
 * @returns {string[]}
 */
function buildTargets(domain) {
  return [`https://www.${domain}/`, `https://${domain}/`];
}

/**
 * Creates an authenticated TEO client. Throws if credentials are missing.
 * @returns {InstanceType<typeof TeoClient>}
 */
function createClient() {
  const secretId = process.env.EO_SECRET_ID;
  const secretKey = process.env.EO_SECRET_KEY;
  if (!secretId || !secretKey) {
    throw new Error(
      'Missing EdgeOne credentials. Set EO_SECRET_ID and EO_SECRET_KEY in the deploy environment.',
    );
  }
  return new TeoClient({
    credential: { secretId, secretKey },
    region: REGION,
    profile: { httpProfile: { endpoint: ENDPOINT } },
  });
}

/**
 * Submits a prefix purge task for a single site.
 * @param {InstanceType<typeof TeoClient>} client
 * @param {{ name: string; zoneId: string; domain: string }} site
 * @returns {Promise<string>}
 */
async function purgeSite(client, site) {
  const targets = buildTargets(site.domain);
  console.log(`[purge] ${site.name} (${site.zoneId}) -> ${targets.join(', ')}`);
  const resp = await client.CreatePurgeTask({
    ZoneId: site.zoneId,
    Type: PURGE_TYPE,
    Method: 'invalidate',
    Targets: targets,
  });
  const failed = resp?.FailedList;
  if (Array.isArray(failed) && failed.length > 0) {
    throw new Error(
      `partial failure, FailedList=${JSON.stringify(failed)}`,
    );
  }
  const jobId = resp?.JobId ?? '(unknown)';
  console.log(`[purge] ${site.name} task submitted: ${jobId}`);
  return jobId;
}

async function main() {
  const client = createClient();
  let failed = false;
  for (const site of SITES) {
    try {
      await purgeSite(client, site);
    } catch (err) {
      failed = true;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[purge] FAILED for ${site.name}: ${message}`);
    }
  }
  if (failed) {
    console.error('[purge] One or more purge tasks failed — aborting deploy cache step.');
    process.exit(1);
  }
  console.log('[purge] All EdgeOne cache purge tasks submitted successfully.');
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[purge] Unexpected error: ${message}`);
  process.exit(1);
});
