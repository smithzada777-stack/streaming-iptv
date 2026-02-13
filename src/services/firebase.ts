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
      // Remove aspas simples/duplas externas se existirem
      serviceAccountStr = serviceAccountStr.replace(/^['"]|['"]$/g, '');

      // Tenta o parse direto
      try {
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (e1: any) {
        // Se falhar, tenta remover quebras de linha FÍSICAS (comuns ao colar no Vercel)
        // mas mantém os \n literais (barra + n)
        const simplified = serviceAccountStr
          .replace(/\r?\n|\r/g, '') // Remove quebras de linha físicas
          .trim();

        try {
          serviceAccount = JSON.parse(simplified);
        } catch (e2: any) {
          throw new Error(`Erro de JSON: ${e2.message} (na posição ${e2.message.match(/\d+/)?.[0] || 'desconhecida'})`);
        }
      }
    } catch (finalError: any) {
      console.error('Firebase: Falha crítica ao processar JSON:', finalError.message);
      throw finalError;
    }
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
        // Corrige o formato da chave privada (crucial para o Firebase)
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
      throw new Error(`Firebase Admin SDK Error: ${error.message}`);
    }
  }

  return null;
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    try {
      const app = initializeFirebase();
      if (!app) {
        throw new Error('As credenciais do Firebase não foram encontradas. Verifique a variável FIREBASE_SERVICE_ACCOUNT_JSON.');
      }
      const firestore = getFirestore(app);
      return (firestore as any)[prop];
    } catch (err: any) {
      // Repassa o erro de forma que apareça no alert do frontend
      throw err;
    }
  }
});

export const getDb = () => db;
