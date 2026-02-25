import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.constants';

type IndiaPostOffice = {
  Name?: string;
  BranchType?: string;
  DeliveryStatus?: string;
  District?: string;
  State?: string;
  Pincode?: string;
};

type IndiaPostResponse = {
  Status?: string;
  Message?: string;
  PostOffice?: IndiaPostOffice[] | null;
};

type GeocodeResult = {
  lat: number;
  lon: number;
};

@Injectable()
export class PincodeService {
  private readonly cacheCollection = 'adviceCache';
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly userAgent =
    process.env.GEOCODER_USER_AGENT || 'SoilFarmingAgent/1.0 (support@local)';

  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async resolvePincode(pincode: string) {
    const cacheKey = `pincode:${pincode}`;
    const cached = await this.getCache<{ state: string; district: string }>(cacheKey);
    if (cached) {
      return cached;
    }

    let response: Response;
    try {
      response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    } catch {
      throw new InternalServerErrorException('Unable to reach India Post service');
    }

    if (!response.ok) {
      throw new InternalServerErrorException(
        `India Post service failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as IndiaPostResponse[];
    const first = payload?.[0];
    const postOffices = (first?.PostOffice || []).filter(Boolean) as IndiaPostOffice[];

    if (first?.Status !== 'Success' || postOffices.length === 0) {
      throw new NotFoundException('Pincode location details not found');
    }

    const selected = this.pickBestPostOffice(postOffices);
    const location = {
      state: selected.State || '',
      district: selected.District || '',
    };

    if (!location.state || !location.district) {
      throw new NotFoundException('Pincode location details not found');
    }

    await this.setCache(cacheKey, location, 30 * 24 * 60 * 60);
    return location;
  }

  async geocodeLocation(params: {
    pincode: string;
    state: string;
    district: string;
  }): Promise<GeocodeResult> {
    const cacheKey = `geo:${params.pincode}:${params.state}:${params.district}`;
    const cached = await this.getCache<GeocodeResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const queries = [
      `${params.pincode}, ${params.district}, ${params.state}, India`,
      `${params.district}, ${params.state}, India`,
    ];

    for (const query of queries) {
      const coordinates = await this.tryGeocode(query);
      if (coordinates) {
        await this.setCache(cacheKey, coordinates, 30 * 24 * 60 * 60);
        return coordinates;
      }
    }

    throw new InternalServerErrorException(
      'Unable to resolve geocoding coordinates for this pincode',
    );
  }

  private async tryGeocode(query: string): Promise<GeocodeResult | null> {
    const url = new URL(this.nominatimUrl);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '3');
    url.searchParams.set('q', query);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: { 'User-Agent': this.userAgent },
      });
    } catch {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as Array<{ lat?: string; lon?: string }>;
    const first = rows.find((item) => item.lat && item.lon);
    if (!first?.lat || !first?.lon) {
      return null;
    }

    const lat = Number(first.lat);
    const lon = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null;
    }

    return { lat, lon };
  }

  private pickBestPostOffice(postOffices: IndiaPostOffice[]) {
    const grouped = new Map<string, { count: number; items: IndiaPostOffice[] }>();

    for (const office of postOffices) {
      const state = office.State || '';
      const district = office.District || '';
      const key = `${state}|${district}`;
      const bucket = grouped.get(key) || { count: 0, items: [] };
      bucket.count += 1;
      bucket.items.push(office);
      grouped.set(key, bucket);
    }

    const bestGroup = Array.from(grouped.values()).sort((a, b) => b.count - a.count)[0];
    const candidates = (bestGroup?.items || postOffices).slice();

    candidates.sort((a, b) => {
      const aScore = this.officeScore(a);
      const bScore = this.officeScore(b);
      return bScore - aScore;
    });

    return candidates[0];
  }

  private officeScore(office: IndiaPostOffice) {
    let score = 0;
    if ((office.DeliveryStatus || '').toLowerCase() === 'delivery') score += 5;
    if ((office.BranchType || '').toLowerCase().includes('head')) score += 2;
    if ((office.Name || '').toLowerCase().includes('gpo')) score += 1;
    return score;
  }

  private async getCache<T>(key: string): Promise<T | null> {
    const snapshot = await this.firestore.collection(this.cacheCollection).doc(key).get();
    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data() as
      | { value?: T; expiresAt?: string }
      | undefined;
    if (!data?.value || !data?.expiresAt) {
      return null;
    }

    if (new Date(data.expiresAt).getTime() <= Date.now()) {
      return null;
    }

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
