import { Injectable } from '@nestjs/common';
import { AgmarknetService } from '../agmarknet/agmarknet.service';
import { MandiPriceView } from './types/advice.types';

const CROP_ALIASES: Record<string, string[]> = {
  Rice: ['Rice', 'Paddy(Dhan)(Common)', 'Paddy', 'Dhan'],
  Wheat: ['Wheat', 'Wheat-Atk'],
  Groundnut: ['Groundnut', 'Ground Nut Seed', 'Ground Nut'],
  Potato: ['Potato'],
};

@Injectable()
export class AdviceMandiService {
  constructor(private readonly agmarknetService: AgmarknetService) {}

  async getMandiByCrop(params: {
    state: string;
    district: string;
    crops: string[];
  }) {
    const result: Record<string, MandiPriceView[]> = {};

    for (const crop of params.crops) {
      result[crop] = await this.fetchCropRows({
        state: params.state,
        district: params.district,
        crop,
      });
    }

    return result;
  }

  private async fetchCropRows(params: {
    state: string;
    district: string;
    crop: string;
  }) {
    const aliases = CROP_ALIASES[params.crop] || [params.crop];
    const merged: MandiPriceView[] = [];
    const seen = new Set<string>();

    for (const alias of aliases) {
      const districtRows = await this.agmarknetService.fetchLive({
        state: params.state,
        district: params.district,
        commodity: alias,
        limit: 25,
      });

      let rows = districtRows.records || [];
      if (!rows.length) {
        const stateRows = await this.agmarknetService.fetchLive({
          state: params.state,
          commodity: alias,
          limit: 25,
        });

        rows = (stateRows.records || []).filter((row) =>
          this.fuzzyDistrictMatch(row.district, params.district),
        );
      }

      for (const row of rows) {
        const key = `${row.market}|${row.arrivalDate}|${row.modalPrice}`;
        if (seen.has(key)) continue;
        seen.add(key);

        merged.push({
          market: row.market,
          min: row.minPrice,
          modal: row.modalPrice,
          max: row.maxPrice,
          date: row.arrivalDate,
        });
      }

      if (merged.length >= 5) break;
    }

    return merged.slice(0, 5);
  }

  private fuzzyDistrictMatch(actual: string, expected: string) {
    const left = (actual || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const right = (expected || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!left || !right) return false;
    return left.includes(right) || right.includes(left);
  }
}
