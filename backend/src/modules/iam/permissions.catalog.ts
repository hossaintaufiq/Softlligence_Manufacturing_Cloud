/** Seeded permission codes for Phase 1 (Section 5). */
export const PERMISSIONS = [
  { code: 'iam.user.read', moduleCode: 'iam', description: 'List and view users' },
  { code: 'iam.user.create', moduleCode: 'iam', description: 'Create users' },
  { code: 'iam.user.update', moduleCode: 'iam', description: 'Update users' },
  { code: 'iam.user.deactivate', moduleCode: 'iam', description: 'Deactivate users' },
  { code: 'iam.user.invite', moduleCode: 'iam', description: 'Invite users' },
  { code: 'iam.user.assign_role', moduleCode: 'iam', description: 'Assign roles to users' },
  { code: 'iam.scope.assign', moduleCode: 'iam', description: 'Assign factory/warehouse scopes' },
  { code: 'iam.role.read', moduleCode: 'iam', description: 'List and view roles' },
  { code: 'iam.role.manage', moduleCode: 'iam', description: 'Create and edit roles/permissions' },
  { code: 'org.company.manage', moduleCode: 'org', description: 'Manage companies' },
  { code: 'org.factory.manage', moduleCode: 'org', description: 'Manage factories' },
  { code: 'modules.read', moduleCode: 'modules', description: 'View tenant enabled modules and entitlements' },
  { code: 'modules.manage', moduleCode: 'modules', description: 'Enable or disable modules for tenant' },
  { code: 'custom_fields.manage', moduleCode: 'modules', description: 'Manage tenant-scoped custom field definitions' },
  { code: 'inventory.items.read', moduleCode: 'inventory', description: 'View item master catalog and UOMs' },
  { code: 'inventory.items.manage', moduleCode: 'inventory', description: 'Create and edit items and UOMs' },
  { code: 'inventory.warehouses.read', moduleCode: 'inventory', description: 'View warehouses' },
  { code: 'inventory.warehouses.manage', moduleCode: 'inventory', description: 'Create and edit warehouses' },
  { code: 'inventory.stock.read', moduleCode: 'inventory', description: 'View stock balances and ledger audit trail' },
  { code: 'inventory.stock.transfer', moduleCode: 'inventory', description: 'Execute stock transfers between warehouses' },
  { code: 'inventory.stock.adjust', moduleCode: 'inventory', description: 'Execute stock adjustments and counts' },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]['code'];

export const TENANT_ADMIN_PERMISSIONS: PermissionCode[] = PERMISSIONS.map((p) => p.code);

export const TENANT_VIEWER_PERMISSIONS: PermissionCode[] = [
  'iam.user.read',
  'iam.role.read',
  'inventory.items.read',
  'inventory.warehouses.read',
  'inventory.stock.read',
];
