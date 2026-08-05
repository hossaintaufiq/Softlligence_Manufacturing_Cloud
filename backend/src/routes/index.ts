import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes.js';
import { identityRouter } from '../modules/identity/identity.routes.js';
import { platformTenancyRouter } from '../modules/tenancy/tenancy.routes.js';
import { organizationRouter } from '../modules/organization/organization.routes.js';
import { iamRouter } from '../modules/iam/iam.routes.js';
import { modulesRouter } from '../modules/modules/modules.routes.js';
import { inventoryRouter } from '../modules/inventory/inventory.routes.js';
import { manufacturingRouter } from '../modules/manufacturing/manufacturing.routes.js';
import { commercialRouter } from '../modules/commercial/commercial.routes.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', identityRouter);
apiRouter.use('/platform', platformTenancyRouter);
apiRouter.use(organizationRouter);
apiRouter.use(iamRouter);
apiRouter.use('/modules', modulesRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/manufacturing', manufacturingRouter);
apiRouter.use('/commercial', commercialRouter);
