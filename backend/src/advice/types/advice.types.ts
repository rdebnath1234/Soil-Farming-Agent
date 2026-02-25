export type LocationContext = {
  pincode: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
};

export type SoilProperties = {
  ph: number | null;
  clay: number | null;
  sand: number | null;
  silt: number | null;
  soc: number | null;
  source: string;
  fetchedAt: string;
};

export type MandiPriceView = {
  market: string;
  min: number;
  modal: number;
  max: number;
  date: string;
};

export type CropRecommendation = {
  crop: string;
  why_bn: string;
  mandi_prices: MandiPriceView[];
};
