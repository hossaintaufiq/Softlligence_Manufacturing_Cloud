export type IndustryTemplateSpec = {
  id: string;
  code: string;
  name: string;
  verticalCategory: 'garments' | 'food_beverage' | 'plastics' | 'chemicals';
  features: string[];
  activeWorkflowsCount: number;
};

export type GarmentStyleItem = {
  id: string;
  styleCode: string;
  styleName: string;
  buyerName: string;
  colorSizeMatrix: string; // e.g. "Red/Blue x S/M/L/XL"
  cutQuantity: number;
  packedQuantity: number;
  packRatioPct: number;
};

const templatesStore: IndustryTemplateSpec[] = [
  { id: 'ind_1', code: 'TMP-GARMENTS', name: 'Garments & Apparel Manufacturing', verticalCategory: 'garments', features: ['Style Master', 'Color-Size Matrix', 'Cut-to-Pack Tracking', 'BOM Marker Ratio'], activeWorkflowsCount: 24 },
  { id: 'ind_2', code: 'TMP-FOOD', name: 'Food & Beverage Process Template', verticalCategory: 'food_beverage', features: ['FEFO Expiry Management', 'Batch Recall Engine', 'Recipe Versioning', 'HACCP Log'], activeWorkflowsCount: 18 },
  { id: 'ind_3', code: 'TMP-PLASTICS', name: 'Plastics & Injection Molding', verticalCategory: 'plastics', features: ['Mold Shot Counter', 'Cavity Multipliers', 'Regrind Scrap %', 'Cooling Cycle Time'], activeWorkflowsCount: 15 },
  { id: 'ind_4', code: 'TMP-CHEMICALS', name: 'Chemical & Process Industry', verticalCategory: 'chemicals', features: ['Hazard Material (GHS) Tagging', 'Exothermic Batch Logs', 'Density/Specific Gravity'], activeWorkflowsCount: 12 },
];

const garmentStylesStore: GarmentStyleItem[] = [
  { id: 'style_1', styleCode: 'STY-2026-POLO-99', styleName: 'Mens Pique Polo Shirt', buyerName: 'H&M Global Purchasing', colorSizeMatrix: 'Navy, Black, White x S, M, L, XL', cutQuantity: 50000, packedQuantity: 48200, packRatioPct: 96.4 },
  { id: 'style_2', styleCode: 'STY-2026-DENIM-04', styleName: 'Slim Fit Stretch Denim Jeans', buyerName: 'Zara Apparel Group', colorSizeMatrix: 'Indigo Dark, Washed Blue x 30, 32, 34, 36', cutQuantity: 30000, packedQuantity: 28900, packRatioPct: 96.3 },
];

export async function getIndustryTemplates() {
  return templatesStore;
}

export async function getGarmentStyles() {
  return garmentStylesStore;
}

export async function createGarmentStyle(data: Omit<GarmentStyleItem, 'id' | 'packRatioPct'>) {
  const packRatioPct = data.cutQuantity > 0 ? Number(((data.packedQuantity / data.cutQuantity) * 100).toFixed(1)) : 0;
  const item: GarmentStyleItem = {
    id: `style_${Date.now()}`,
    ...data,
    packRatioPct,
  };
  garmentStylesStore.unshift(item);
  return item;
}
