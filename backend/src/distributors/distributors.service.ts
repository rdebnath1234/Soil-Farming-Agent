import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FIRESTORE } from '../firebase/firebase.constants';
import { Firestore } from 'firebase-admin/firestore';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { DistributorRecord } from './types/distributor-record.type';

@Injectable()
export class DistributorsService {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async create(createDistributorDto: CreateDistributorDto, postedBy: string) {
    const now = new Date().toISOString();
    const docRef = this.firestore.collection('distributors').doc();
    const distributor: DistributorRecord = {
      _id: docRef.id,
      ...createDistributorDto,
      postedBy,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(distributor);
    return distributor;
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
      .collection('distributors')
      .orderBy('createdAt', 'desc')
      .get();

    let items = snapshot.docs.map((doc) => doc.data() as DistributorRecord);

    if (search) {
      items = items.filter((item) =>
        [item.name, item.contactPerson, item.address, item.seedsAvailable]
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

  async update(id: string, updateDistributorDto: UpdateDistributorDto) {
    const docRef = this.firestore.collection('distributors').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      throw new NotFoundException('Distributor details not found');
    }

    await docRef.set(
      {
        ...updateDistributorDto,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    const updated = await docRef.get();
    return updated.data() as DistributorRecord;
  }

  async remove(id: string) {
    const docRef = this.firestore.collection('distributors').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      throw new NotFoundException('Distributor details not found');
    }

    await docRef.delete();
    return { message: 'Distributor details deleted successfully' };
  }
}
