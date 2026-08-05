export type ModuleCatalogItem = {
  code: string;
  name: string;
  description: string;
  category: string;
  isCore: boolean;
  defaultEnabled: boolean;
};

export const MODULE_CATALOG: readonly ModuleCatalogItem[] = [
  {
    code: 'org',
    name: 'Organization & Factory Hierarchy',
    description: 'Companies, plants, factories, and operational organizational units.',
    category: 'core',
    isCore: true,
    defaultEnabled: true,
  },
  {
    code: 'iam',
    name: 'Identity & Access Control',
    description: 'Users, roles, permissions, scopes, and security settings.',
    category: 'core',
    isCore: true,
    defaultEnabled: true,
  },
  {
    code: 'inventory',
    name: 'Inventory & Stock Core',
    description: 'Item master, stock balances, warehouses, transfers, and ledger adjustments.',
    category: 'operations',
    isCore: false,
    defaultEnabled: true,
  },
  {
    code: 'manufacturing',
    name: 'Manufacturing & Work Orders',
    description: 'Work order execution, shop floor posting, yield KPIs, and energy tracking.',
    category: 'operations',
    isCore: false,
    defaultEnabled: true,
  },
  {
    code: 'commercial',
    name: 'Commercial & Dispatch Ops',
    description: 'Vendors, purchase orders, sales dispatch, GRN, and challans.',
    category: 'commercial',
    isCore: false,
    defaultEnabled: true,
  },
  {
    code: 'steel',
    name: 'Steel Industry Template Pack',
    description: 'Heat tracking, billet inventory, coil specs, and steel-specific operational views.',
    category: 'industry_templates',
    isCore: false,
    defaultEnabled: false,
  },
] as const;
