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
    console.log(`Firebase: Chave encontrada. Tamanho: ${serviceAccountStr.length} caracteres.`);
    try {
      // Limpeza de aspas de qualquer tipo
      serviceAccountStr = serviceAccountStr.replace(/^['"]|['"]$/g, '');

      // Tenta o parse direto
      try {
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (parseError) {
        // Tenta limpar quebras de linha reais
        const normalized = serviceAccountStr.replace(/\n/g, '\\n');
        serviceAccount = JSON.parse(normalized);
      }
    } catch (finalError: any) {
      console.error('Firebase: Falha crítica no parse do JSON:', finalError.message);
    }
  } else {
    console.warn('Firebase: Variável FIREBASE_SERVICE_ACCOUNT_JSON está VAZIA no servidor.');
  }

  // Fallback para arquivo local (desenvolvimento)
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
      console.log('Firebase: Inicializado com sucesso.');
      return firebaseApp;
    } catch (error: any) {
      console.error('Firebase: Erro no Admin SDK:', error.message);
    }
  }

  return null;
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    const app = initializeFirebase();
    if (!app) {
      const envStatus = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? `Existe (Tamanho: ${process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length})` : 'Não existe';
      throw new Error(`Firebase não inicializado. Variável FIREBASE_SERVICE_ACCOUNT_JSON: ${envStatus}. Verifique se fez o Redeploy na Vercel.`);
    }
    const firestore = getFirestore(app);
    return (firestore as any)[prop];
  }
});

export const getDb = () => db;
