export type MandiPriceRecord = {
  _id: string;
  source: 'agmarknet';
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  syncedAt: string;
  raw?: Record<string, unknown>;
};
