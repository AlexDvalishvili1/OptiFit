import {getApps, initializeApp, cert} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";

const app =
    getApps().length > 0
        ? getApps()[0]!
        : initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
                clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL!,
                privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            }),
        });

export const firebaseAdminAuth = getAuth(app);