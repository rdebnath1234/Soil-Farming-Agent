import { Inject, Injectable } from '@nestjs/common';
import { FIRESTORE } from '../firebase/firebase.constants';
import { Firestore } from 'firebase-admin/firestore';
import * as bcrypt from 'bcrypt';
import { Role } from './role.enum';
import { UserRecord } from './types/user-record.type';

@Injectable()
export class UsersService {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    const now = new Date().toISOString();
    const docRef = this.firestore.collection('users').doc();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user: UserRecord = {
      _id: docRef.id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || Role.USER,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(user);
    return this.sanitize(user);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const snapshot = await this.firestore
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as UserRecord;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const snapshot = await this.firestore.collection('users').doc(id).get();
    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as UserRecord;
  }

  sanitize(user: UserRecord | (Omit<UserRecord, 'password'> & { password?: string })) {
    const { password: _password, ...rest } = user;
    return rest;
  }

  async ensureDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existing = await this.findByEmail(adminEmail);
    if (!existing) {
      await this.create({
        name: 'Default Admin',
        email: adminEmail,
        password: adminPassword,
        role: Role.ADMIN,
      });
    }
  }
}
