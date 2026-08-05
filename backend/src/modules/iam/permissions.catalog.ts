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
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]['code'];

export const TENANT_ADMIN_PERMISSIONS: PermissionCode[] = PERMISSIONS.map((p) => p.code);

export const TENANT_VIEWER_PERMISSIONS: PermissionCode[] = [
  'iam.user.read',
  'iam.role.read',
];
