import { apiBase, parseJson } from './client.js';

export type CustomFieldItem = {
  id: string;
  tenantId: string;
  entityType: string;
  fieldKey: string;
  label: string;
  dataType: string;
  isRequired: boolean;
  optionsJson: unknown;
  createdAt: string;
};

export async function fetchCustomFields(entityType?: string): Promise<CustomFieldItem[]> {
  const q = entityType ? `?entityType=${encodeURIComponent(entityType)}` : '';
  const res = await fetch(`${apiBase()}/api/v1/custom-fields${q}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await parseJson<{ data: CustomFieldItem[] }>(res);
  return data.data;
}

export async function createCustomFieldApi(input: {
  entityType: string;
  fieldKey: string;
  label: string;
  dataType?: string;
  isRequired?: boolean;
}): Promise<CustomFieldItem> {
  const res = await fetch(`${apiBase()}/api/v1/custom-fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: CustomFieldItem }>(res);
  return data.data;
}

export async function deleteCustomFieldApi(id: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/v1/custom-fields/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  await parseJson<{ data: { message: string } }>(res);
}
