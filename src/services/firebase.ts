import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let firebaseApp: App | null = null;

function initializeFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  let serviceAccount = null;
  let serviceAccountStr = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();

  if (serviceAccountStr) {
    try {
      // 1. Tenta detectar se é Base64 (comum para evitar erros de escape na Vercel)
      if (!serviceAccountStr.startsWith('{') && !serviceAccountStr.startsWith('[') && !serviceAccountStr.startsWith("'") && !serviceAccountStr.startsWith('"')) {
        try {
          const decoded = Buffer.from(serviceAccountStr, 'base64').toString('utf-8');
          if (decoded.startsWith('{')) {
            serviceAccountStr = decoded;
            console.log('Firebase: Credenciais decodificadas do formato Base64.');
          }
        } catch (e) { }
      }

      // 2. Limpeza profunda de aspas e quebras de linha
      let cleanJson = serviceAccountStr.replace(/^['"]|['"]$/g, '').trim();

      try {
        serviceAccount = JSON.parse(cleanJson);
      } catch (e1: any) {
        // 3. Se falhar, tenta remover quebras de linha físicas e corrigir escapes de barra
        const fixed = cleanJson
          .replace(/\r?\n|\r/g, '') // Remove quebras de linha físicas
          .replace(/\\(?!["\\\/bfnrtu])/g, '\\\\'); // Escapa barras invertidas soltas

        try {
          serviceAccount = JSON.parse(fixed);
        } catch (e2: any) {
          throw new Error(`Erro de JSON: ${e2.message} na posição ${e2.message.match(/\d+/)?.[0] || '?'}`);
        }
      }
    } catch (finalError: any) {
      console.error('Firebase: Falha no processamento do JSON:', finalError.message);
      throw finalError;
    }
  }

  // Fallback local
  if (!serviceAccount) {
    try {
      const localFile = path.resolve(process.cwd(), 'redflix-iptv-3d47b-firebase-adminsdk-fbsvc-ca8f0cd6f6.json');
      if (fs.existsSync(localFile)) {
        serviceAccount = JSON.parse(fs.readFileSync(localFile, 'utf8'));
      }
    } catch (e) { }
  }

  if (serviceAccount) {
    try {
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      });
      return firebaseApp;
    } catch (error: any) {
      console.error('Firebase Admin SDK Error:', error.message);
      throw error;
    }
  }

  return null;
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    const app = initializeFirebase();
    if (!app) {
      throw new Error('Firebase não configurado. Verifique a variável FIREBASE_SERVICE_ACCOUNT_JSON.');
    }
    const firestore = getFirestore(app);
    return (firestore as any)[prop];
  }
});

export const getDb = () => db;
