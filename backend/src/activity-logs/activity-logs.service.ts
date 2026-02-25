import { Inject, Injectable } from '@nestjs/common';
import { FIRESTORE } from '../firebase/firebase.constants';
import { Firestore } from 'firebase-admin/firestore';
import { ActivityLogRecord } from './types/activity-log-record.type';

@Injectable()
export class ActivityLogsService {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async create(data: {
    action: string;
    actorEmail: string;
    actorRole: string;
    message: string;
  }) {
    const docRef = this.firestore.collection('activityLogs').doc();
    const log: ActivityLogRecord = {
      _id: docRef.id,
      action: data.action,
      actorEmail: data.actorEmail,
      actorRole: data.actorRole,
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    await docRef.set(log);
    return log;
  }

  async getRecent(limit = 100) {
    const snapshot = await this.firestore
      .collection('activityLogs')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as ActivityLogRecord);
  }
}
