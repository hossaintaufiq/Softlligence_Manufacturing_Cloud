import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';
import { ensureTenantIamDefaults } from '../iam/iam.permissions.js';
import { ensureTenantModuleDefaults } from '../modules/modules.service.js';
import { issueSession } from '../identity/identity.service.js';

export type OnboardingInput = {
  companyName: string;
  companyCode: string;
  currency: string;
  industry: string;
  email: string;
  passwordPlane: string;
  planCode: string;
  factoryName: string;
  factoryCode: string;
  timezone: string;
  userAgent?: string;
  ipAddress?: string;
};

export async function onboardTenant(input: OnboardingInput) {
  const email = input.email.trim().toLowerCase();
  const companyName = input.companyName.trim();
  const companyCode = input.companyCode.trim().toUpperCase();
  const planCode = input.planCode.trim() || 'trial';

  if (!email || !input.passwordPlane || !companyName || !companyCode) {
    throw new AppError(400, 'Company Name, Code, Admin Email and Password are required', 'VALIDATION_ERROR');
  }

  // Generate unique slug
  let slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!slug) slug = 'company-' + Math.random().toString(36).slice(2, 7);

  // Check unique constraints
  const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
  if (existingTenant) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
  }

  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) {
    throw new AppError(409, 'User with this email already exists', 'CONFLICT');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.passwordPlane, 12);

  // Run in single transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Tenant
    const tenant = await tx.tenant.create({
      data: {
        slug,
        name: companyName,
        status: 'active',
        planCode,
      },
    });

    // 2. Create Company
    const company = await tx.company.create({
      data: {
        tenantId: tenant.id,
        name: companyName,
        code: companyCode,
        currency: input.currency || 'USD',
        status: 'active',
      },
    });

    // 3. Create Factory
    const factory = await tx.factory.create({
      data: {
        tenantId: tenant.id,
        companyId: company.id,
        name: input.factoryName || 'Primary Plant',
        code: input.factoryCode || 'MAIN',
        timezone: input.timezone || 'UTC',
        status: 'active',
      },
    });

    // 4. Create User
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name: 'Company Admin',
        passwordHash,
        status: 'active',
        isPlatformAdmin: false,
      },
    });

    return { tenant, company, factory, user };
  });

  // Seed default tenant roles & permissions outside transaction to avoid lock escalation on catalog
  const { adminRoleId } = await ensureTenantIamDefaults(result.tenant.id);
  await ensureTenantModuleDefaults(result.tenant.id);

  // Associate user to the tenant admin role
  await prisma.userRole.create({
    data: {
      tenantId: result.tenant.id,
      userId: result.user.id,
      roleId: adminRoleId,
    },
  });

  // Apply Industry Template modules configuration
  const templateModulesMap: Record<string, string[]> = {
    steel: ['org', 'iam', 'inventory', 'manufacturing', 'commercial', 'steel'],
    garments: ['org', 'iam', 'inventory', 'manufacturing', 'commercial', 'industry-templates'],
    textile: ['org', 'iam', 'inventory', 'manufacturing', 'commercial'],
    food: ['org', 'iam', 'inventory', 'manufacturing', 'commercial'],
    plastic: ['org', 'iam', 'inventory', 'manufacturing', 'commercial'],
    chemical: ['org', 'iam', 'inventory', 'manufacturing', 'commercial'],
  };

  const selectedModules = templateModulesMap[input.industry.toLowerCase()] || ['org', 'iam', 'inventory', 'manufacturing', 'commercial'];

  // Enable these modules in TenantModule map
  for (const moduleCode of selectedModules) {
    await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleCode: {
          tenantId: result.tenant.id,
          moduleCode,
        },
      },
      update: { enabled: true },
      create: {
        tenantId: result.tenant.id,
        moduleCode,
        enabled: true,
      },
    });
  }

  // Map user and tenant models for auth session
  const authUser = {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
    status: result.user.status,
    tenantId: result.tenant.id,
    isPlatformAdmin: false,
    tenant: {
      id: result.tenant.id,
      slug: result.tenant.slug,
      name: result.tenant.name,
      status: result.tenant.status,
      planCode: result.tenant.planCode,
    },
  };

  // Issue active session for instant redirect
  const authBundle = await issueSession({
    user: authUser,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  });

  return authBundle;
}
