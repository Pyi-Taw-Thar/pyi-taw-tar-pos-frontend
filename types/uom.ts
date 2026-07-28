export interface UomConversion {
  unit: string;
  factor: number;
  isDefaultSellingUnit?: boolean;
  convertFrom?: string | null;
}

export interface InventoryUomFields {
  unitOfMeasure: string;
  uomConversions?: UomConversion[];
}
