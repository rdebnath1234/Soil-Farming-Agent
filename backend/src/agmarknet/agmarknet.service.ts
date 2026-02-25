import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { createHash } from 'node:crypto';
import { FIRESTORE } from '../firebase/firebase.constants';
import { QueryAgmarknetDto } from './dto/query-agmarknet.dto';
import { MandiPriceRecord } from './types/mandi-price.type';

type AgmarknetApiRecord = {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrival_date?: string;
  min_price?: number | string;
  max_price?: number | string;
  modal_price?: number | string;
  [key: string]: unknown;
};

@Injectable()
export class AgmarknetService {
  private readonly resourceId =
    process.env.AGMARKNET_RESOURCE_ID ||
    '9ef84268-d588-465a-a308-a864a43d0070';
  private readonly apiKey =
    process.env.AGMARKNET_API_KEY ||
    '579b464db66ec23bdd000001d9143fc81ac74bce7ad727abc2705a8a';
  private readonly baseUrl = 'https://api.data.gov.in/resource';

  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async fetchLive(query: QueryAgmarknetDto) {
    const limit = query.limit || 25;
    const offset = query.offset || 0;
    const url = this.buildUrl(query, limit, offset);

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadGatewayException(
        `Agmarknet request failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as {
      total?: number;
      count?: number;
      records?: AgmarknetApiRecord[];
      updated_date?: string;
      title?: string;
    };

    const records = (data.records || []).map((item) => this.mapRecord(item));

    return {
      source: 'agmarknet',
      title: data.title || 'Current Daily Price of Various Commodities',
      updatedDate: data.updated_date || '',
      total: data.total ?? records.length,
      count: data.count ?? records.length,
      limit,
      offset,
      records,
    };
  }

  async syncToDb(query: QueryAgmarknetDto) {
    const live = await this.fetchLive(query);
    const batch = this.firestore.batch();
    const syncedAt = new Date().toISOString();

    live.records.forEach((record) => {
      const recordId = this.toStableRecordId(record);
      const docRef = this.firestore.collection('agmarknetPrices').doc(recordId);
      batch.set(
        docRef,
        {
          ...record,
          _id: recordId,
          source: 'agmarknet',
          syncedAt,
        },
        { merge: true },
      );
    });

    if (live.records.length) {
      await batch.commit();
    }

    return {
      ...live,
      synced: live.records.length,
      syncedAt,
    };
  }

  private buildUrl(query: QueryAgmarknetDto, limit: number, offset: number) {
    const params = new URLSearchParams({
      'api-key': this.apiKey,
      format: 'json',
      limit: String(limit),
      offset: String(offset),
    });

    if (query.state) {
      params.set('filters[state]', query.state);
    }
    if (query.district) {
      params.set('filters[district]', query.district);
    }
    if (query.market) {
      params.set('filters[market]', query.market);
    }
    if (query.commodity) {
      params.set('filters[commodity]', query.commodity);
    }
    if (query.arrivalDate) {
      params.set('filters[arrival_date]', query.arrivalDate);
    }

    return `${this.baseUrl}/${this.resourceId}?${params.toString()}`;
  }

  private mapRecord(item: AgmarknetApiRecord): Omit<MandiPriceRecord, '_id' | 'syncedAt'> {
    return {
      source: 'agmarknet',
      state: String(item.state || ''),
      district: String(item.district || ''),
      market: String(item.market || ''),
      commodity: String(item.commodity || ''),
      variety: String(item.variety || ''),
      grade: String(item.grade || ''),
      arrivalDate: String(item.arrival_date || ''),
      minPrice: this.toNumber(item.min_price),
      maxPrice: this.toNumber(item.max_price),
      modalPrice: this.toNumber(item.modal_price),
      raw: item,
    };
  }

  private toNumber(value: unknown) {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = Number(value.replace(/,/g, ''));
      return Number.isFinite(normalized) ? normalized : 0;
    }
    return 0;
  }

  private toStableRecordId(record: Omit<MandiPriceRecord, '_id' | 'syncedAt'>) {
    const rawKey = [
      record.arrivalDate,
      record.state,
      record.district,
      record.market,
      record.commodity,
      record.variety,
      record.grade,
      record.minPrice,
      record.maxPrice,
      record.modalPrice,
    ].join('|');

    return createHash('sha1').update(rawKey).digest('hex');
  }
}
