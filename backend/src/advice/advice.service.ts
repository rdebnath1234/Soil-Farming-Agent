import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { FIRESTORE } from '../firebase/firebase.constants';
import { generateCropRecommendations } from './crop-rules.util';
import { AdviceMandiService } from './mandi.service';
import { PincodeService } from './pincode.service';
import { AdviceSoilService } from './soil.service';
import { CropRecommendation, LocationContext } from './types/advice.types';

@Injectable()
export class AdviceService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore,
    private readonly pincodeService: PincodeService,
    private readonly soilService: AdviceSoilService,
    private readonly mandiService: AdviceMandiService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async getAdvice(pincode: string, actor: { email: string; role: string }) {
    const location = await this.resolveLocation(pincode);
    const soil = await this.soilService.getSoilProperties(
      location.lat,
      location.lon,
    );

    const recommendationsBase = generateCropRecommendations(soil);
    const cropNames = recommendationsBase.map((item) => item.crop);

    let mandiByCrop: Record<
      string,
      {
        market: string;
        min: number;
        modal: number;
        max: number;
        date: string;
      }[]
    >;
    try {
      mandiByCrop = await this.mandiService.getMandiByCrop({
        state: location.state,
        district: location.district,
        crops: cropNames,
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch mandi prices');
    }

    const recommendations: CropRecommendation[] = recommendationsBase.map(
      (item) => ({
        crop: item.crop,
        why_bn: item.why_bn,
        mandi_prices: mandiByCrop[item.crop] || [],
      }),
    );

    const totalMandiRows = recommendations.reduce(
      (acc, item) => acc + item.mandi_prices.length,
      0,
    );
    if (totalMandiRows === 0) {
      throw new NotFoundException('No mandi data found for this location');
    }

    const advisory = {
      location,
      soil,
      recommendations,
    };

    await this.saveAdvisoryHistory({
      pincode,
      actorEmail: actor.email,
      actorRole: actor.role,
      ...advisory,
    });

    await this.activityLogsService.create({
      action: 'ADVICE_GENERATED',
      actorEmail: actor.email,
      actorRole: actor.role,
      message: `Advisory generated for pincode ${pincode} (${location.district}, ${location.state})`,
    });

    return advisory;
  }

  private async resolveLocation(pincode: string): Promise<LocationContext> {
    const basic = await this.pincodeService.resolvePincode(pincode);
    const geo = await this.pincodeService.geocodeLocation({
      pincode,
      state: basic.state,
      district: basic.district,
    });

    return {
      pincode,
      state: basic.state,
      district: basic.district,
      lat: Number(geo.lat.toFixed(6)),
      lon: Number(geo.lon.toFixed(6)),
    };
  }

  private async saveAdvisoryHistory(payload: {
    pincode: string;
    actorEmail: string;
    actorRole: string;
    location: LocationContext;
    soil: unknown;
    recommendations: CropRecommendation[];
  }) {
    const now = new Date().toISOString();
    const docRef = this.firestore.collection('advisories').doc();

    await docRef.set({
      _id: docRef.id,
      pincode: payload.pincode,
      actorEmail: payload.actorEmail,
      actorRole: payload.actorRole,
      location: payload.location,
      soil: payload.soil,
      recommendations: payload.recommendations,
      createdAt: now,
      updatedAt: now,
    });
  }
}
