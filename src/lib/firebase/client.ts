import {initializeApp, getApps} from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API!,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.FIREBASE_PROJECT_ID!,
    appId: process.env.FIREBASE_APP_ID!,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);