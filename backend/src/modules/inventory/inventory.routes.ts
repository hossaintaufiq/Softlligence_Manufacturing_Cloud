import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { requireTenantUser } from '../organization/organization.middleware.js';
import { requirePermission } from '../iam/iam.middleware.js';
import {
  handleCreateItem,
  handleCreateUom,
  handleCreateWarehouse,
  handleExecuteStockAdjustment,
  handleExecuteStockTransfer,
  handleGetItem,
  handleGetStockBalances,
  handleGetStockLedger,
  handleListItems,
  handleListUoms,
  handleListWarehouses,
} from './inventory.controller.js';

export const inventoryRouter = Router();

// Protect all inventory endpoints
inventoryRouter.use(requireAuth, requireTenantUser);

// Warehouses API
inventoryRouter.get('/warehouses', requirePermission('inventory.warehouses.read'), handleListWarehouses);
inventoryRouter.post('/warehouses', requirePermission('inventory.warehouses.manage'), handleCreateWarehouse);

// Units of Measure API
inventoryRouter.get('/uoms', requirePermission('inventory.items.read'), handleListUoms);
inventoryRouter.post('/uoms', requirePermission('inventory.items.manage'), handleCreateUom);

// Items Catalog API
inventoryRouter.get('/items', requirePermission('inventory.items.read'), handleListItems);
inventoryRouter.post('/items', requirePermission('inventory.items.manage'), handleCreateItem);
inventoryRouter.get('/items/:id', requirePermission('inventory.items.read'), handleGetItem);

// Stock Balances & Ledger API
inventoryRouter.get('/balances', requirePermission('inventory.stock.read'), handleGetStockBalances);
inventoryRouter.get('/ledger', requirePermission('inventory.stock.read'), handleGetStockLedger);

// Stock Movements (Transfers & Adjustments)
inventoryRouter.post('/transfers', requirePermission('inventory.stock.transfer'), handleExecuteStockTransfer);
inventoryRouter.post('/adjustments', requirePermission('inventory.stock.adjust'), handleExecuteStockAdjustment);
