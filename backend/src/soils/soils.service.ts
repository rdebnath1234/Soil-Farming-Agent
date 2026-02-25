import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FIRESTORE } from '../firebase/firebase.constants';
import { Firestore } from 'firebase-admin/firestore';
import { CreateSoilDto } from './dto/create-soil.dto';
import { UpdateSoilDto } from './dto/update-soil.dto';
import { SoilRecord } from './types/soil-record.type';

@Injectable()
export class SoilsService {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async create(createSoilDto: CreateSoilDto, postedBy: string) {
    const now = new Date().toISOString();
    const docRef = this.firestore.collection('soils').doc();
    const soil: SoilRecord = {
      _id: docRef.id,
      ...createSoilDto,
      postedBy,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(soil);
    return soil;
  }

  async findAll(options: { search?: string; page?: number; limit?: number }) {
    const search = (options.search || '').trim().toLowerCase();
    const page =
      Number.isFinite(options.page) && options.page && options.page > 0
        ? Math.floor(options.page)
        : 1;
    const limit =
      Number.isFinite(options.limit) && options.limit && options.limit > 0
        ? Math.min(Math.floor(options.limit), 50)
        : 6;

    const snapshot = await this.firestore
      .collection('soils')
      .orderBy('createdAt', 'desc')
      .get();

    let items = snapshot.docs.map((doc) => doc.data() as SoilRecord);

    if (search) {
      items = items.filter((item) =>
        [
          item.soilType,
          item.suitableCrops,
          item.nutrients,
          item.irrigationTips,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search),
      );
    }

    const total = items.length;
    const skip = (page - 1) * limit;
    const paginatedItems = items.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async update(id: string, updateSoilDto: UpdateSoilDto) {
    const docRef = this.firestore.collection('soils').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      throw new NotFoundException('Soil details not found');
    }

    await docRef.set(
      {
        ...updateSoilDto,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    const updated = await docRef.get();
    return updated.data() as SoilRecord;
  }

  async remove(id: string) {
    const docRef = this.firestore.collection('soils').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      throw new NotFoundException('Soil details not found');
    }

    await docRef.delete();
    return { message: 'Soil details deleted successfully' };
  }
}
