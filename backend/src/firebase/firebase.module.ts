import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FIRESTORE } from './firebase.constants';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

@Global()
@Module({
  providers: [
    {
      provide: FIRESTORE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const projectId = config.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKeyRaw = config.get<string>('FIREBASE_PRIVATE_KEY');
        const privateKey = privateKeyRaw?.replace(/\\n/g, '\n');

        const app =
          getApps()[0] ||
          initializeApp(
            projectId && clientEmail && privateKey
              ? {
                  credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                  }),
                }
              : undefined,
          );

        return getFirestore(app);
      },
    },
  ],
  exports: [FIRESTORE],
})
export class FirebaseModule {}
