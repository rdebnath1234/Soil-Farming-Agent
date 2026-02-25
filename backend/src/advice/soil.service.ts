import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.constants';
import { SoilProperties } from './types/advice.types';

type SoilGridLayer = {
  name?: string;
  unit_measure?: { d_factor?: number };
  depths?: Array<{ values?: Record<string, number | null | undefined> }>;
};

@Injectable()
export class AdviceSoilService {
  private readonly cacheCollection = 'adviceCache';
  private readonly soilGridsUrl =
    'https://rest.isric.org/soilgrids/v2.0/properties/query';

  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async getSoilProperties(lat: number, lon: number): Promise<SoilProperties> {
    const roundedLat = Number(lat.toFixed(4));
    const roundedLon = Number(lon.toFixed(4));
    const cacheKey = `soil:${roundedLat}:${roundedLon}`;

    const cached = await this.getCache<SoilProperties>(cacheKey);
    if (cached) {
      return cached;
    }

    const url = new URL(this.soilGridsUrl);
    url.searchParams.set('lat', String(roundedLat));
    url.searchParams.set('lon', String(roundedLon));
    url.searchParams.set('depth', '0-5cm');
    url.searchParams.set('value', 'Q0.5');
    ['phh2o', 'clay', 'sand', 'silt', 'soc'].forEach((property) =>
      url.searchParams.append('property', property),
    );

    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch {
      throw new InternalServerErrorException('Unable to reach SoilGrids service');
    }

    if (!response.ok) {
      throw new InternalServerErrorException(
        `SoilGrids request failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as { properties?: { layers?: SoilGridLayer[] } };
    const layers = payload?.properties?.layers || [];

    const soil: SoilProperties = {
      ph: this.extract(layers, 'phh2o'),
      clay: this.extract(layers, 'clay'),
      sand: this.extract(layers, 'sand'),
      silt: this.extract(layers, 'silt'),
      soc: this.extract(layers, 'soc'),
      source: 'SoilGrids v2',
      fetchedAt: new Date().toISOString(),
    };

    if (
      soil.ph === null &&
      soil.clay === null &&
      soil.sand === null &&
      soil.silt === null &&
      soil.soc === null
    ) {
      throw new InternalServerErrorException(
        'SoilGrids returned empty values for the selected location',
      );
    }

    await this.setCache(cacheKey, soil, 24 * 60 * 60);
    return soil;
  }

  private extract(layers: SoilGridLayer[], name: string) {
    const layer = layers.find((item) => item.name === name);
    const dFactor = layer?.unit_measure?.d_factor || 1;
    const valueMap = layer?.depths?.[0]?.values || {};
    const rawValue = this.pickValue(valueMap);

    if (rawValue === null || rawValue === undefined || !Number.isFinite(rawValue)) {
      return null;
    }

    const normalized = rawValue / dFactor;
    return Number(normalized.toFixed(2));
  }

  private pickValue(values: Record<string, number | null | undefined>) {
    if (typeof values.Q0_5 === 'number') return values.Q0_5;
    if (typeof values['Q0.5'] === 'number') return values['Q0.5'];
    if (typeof values.mean === 'number') return values.mean;
    const first = Object.values(values).find((value) => typeof value === 'number');
    return typeof first === 'number' ? first : null;
  }

  private async getCache<T>(key: string): Promise<T | null> {
    const snapshot = await this.firestore.collection(this.cacheCollection).doc(key).get();
    if (!snapshot.exists) return null;

    const data = snapshot.data() as
      | { value?: T; expiresAt?: string }
      | undefined;
    if (!data?.value || !data?.expiresAt) return null;
    if (new Date(data.expiresAt).getTime() <= Date.now()) return null;

    return data.value;
  }

  private async setCache(key: string, value: unknown, ttlSeconds: number) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();
    await this.firestore.collection(this.cacheCollection).doc(key).set({
      key,
      value,
      createdAt: now.toISOString(),
      expiresAt,
    });
  }
}
