import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes.js';
import { identityRouter } from '../modules/identity/identity.routes.js';
import { platformTenancyRouter } from '../modules/tenancy/tenancy.routes.js';
import { organizationRouter } from '../modules/organization/organization.routes.js';
import { iamRouter } from '../modules/iam/iam.routes.js';
import { customFieldsRouter, modulesRouter } from '../modules/modules/modules.routes.js';
import { inventoryRouter } from '../modules/inventory/inventory.routes.js';
import { manufacturingRouter } from '../modules/manufacturing/manufacturing.routes.js';
import { commercialRouter } from '../modules/commercial/commercial.routes.js';
import { steelRouter } from '../modules/steel/steel.routes.js';
import { platformServicesRouter } from '../modules/platformServices/platformServices.routes.js';
import { analyticsRouter } from '../modules/analytics/analytics.routes.js';
import { mesRouter } from '../modules/mes/mes.routes.js';
import { wmsRouter } from '../modules/wms/wms.routes.js';
import { logisticsRouter } from '../modules/logistics/logistics.routes.js';
import { industryTemplatesRouter } from '../modules/industryTemplates/industryTemplates.routes.js';
import { developerPlatformRouter } from '../modules/developerPlatform/developerPlatform.routes.js';
import { complianceRouter } from '../modules/governance/compliance.routes.js';
import { aiPredictiveRouter } from '../modules/aiPredictive/aiPredictive.routes.js';
import { localizationRouter } from '../modules/localization/localization.routes.js';
import { enterpriseHaRouter } from '../modules/ha/enterpriseHa.routes.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', identityRouter);
apiRouter.use('/platform', platformTenancyRouter);
apiRouter.use(organizationRouter);
apiRouter.use(iamRouter);
apiRouter.use('/modules', modulesRouter);
apiRouter.use('/custom-fields', customFieldsRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/manufacturing', manufacturingRouter);
apiRouter.use('/commercial', commercialRouter);
apiRouter.use('/steel', steelRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/mes', mesRouter);
apiRouter.use('/wms', wmsRouter);
apiRouter.use('/logistics', logisticsRouter);
apiRouter.use('/industry-templates', industryTemplatesRouter);
apiRouter.use('/developer', developerPlatformRouter);
apiRouter.use('/governance', complianceRouter);
apiRouter.use('/ai', aiPredictiveRouter);
apiRouter.use('/localization', localizationRouter);
apiRouter.use('/ha', enterpriseHaRouter);
apiRouter.use('/', platformServicesRouter);






