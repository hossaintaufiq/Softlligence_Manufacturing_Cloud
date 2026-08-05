import crypto from 'node:crypto';

export type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  status: 'ACTIVE' | 'REVOKED';
  permissions: string[];
  createdAt: string;
};

export type WebhookItem = {
  id: string;
  targetUrl: string;
  events: string[];
  secretKey: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
};

const apiKeyStore: ApiKeyItem[] = [
  { id: 'key_1', name: 'Tally Accounting Sync', keyPrefix: 'smc_live_9a', keyHash: 'hash_123', status: 'ACTIVE', permissions: ['read:stock', 'write:challan'], createdAt: new Date().toISOString() },
  { id: 'key_2', name: 'Salesforce CRM Integration', keyPrefix: 'smc_live_3f', keyHash: 'hash_456', status: 'ACTIVE', permissions: ['read:customers', 'write:sales_orders'], createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const webhookStore: WebhookItem[] = [
  { id: 'wh_1', targetUrl: 'https://accounting.client.com/webhooks/smc', events: ['dispatch.issued', 'grn.posted'], secretKey: 'whsec_8892109', status: 'ACTIVE', createdAt: new Date().toISOString() },
];

export async function getApiKeys() {
  return apiKeyStore;
}

export async function generateApiKey(name: string, permissions: string[]) {
  const secretPart = crypto.randomBytes(16).toString('hex');
  const fullKey = `smc_live_${secretPart}`;
  const keyPrefix = fullKey.slice(0, 12);
  const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

  const apiKey: ApiKeyItem = {
    id: `key_${Date.now()}`,
    name: name || 'API Key',
    keyPrefix,
    keyHash,
    status: 'ACTIVE',
    permissions: permissions || ['read:all'],
    createdAt: new Date().toISOString(),
  };

  apiKeyStore.unshift(apiKey);
  return { apiKey, fullKeySecret: fullKey };
}

export async function getWebhooks() {
  return webhookStore;
}

export async function createWebhook(targetUrl: string, events: string[]) {
  const item: WebhookItem = {
    id: `wh_${Date.now()}`,
    targetUrl,
    events: events || ['*'],
    secretKey: `whsec_${crypto.randomBytes(12).toString('hex')}`,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  webhookStore.unshift(item);
  return item;
}
