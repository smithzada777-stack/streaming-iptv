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
      // Remove aspas sobrando se o usuário colou com elas
      if ((serviceAccountStr.startsWith("'") && serviceAccountStr.endsWith("'")) ||
        (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"'))) {
        serviceAccountStr = serviceAccountStr.slice(1, -1);
      }

      // Tenta o parse direto
      try {
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (parseError) {
        // Se falhar, tenta escapar quebras de linha que podem estar "nuas"
        const normalized = serviceAccountStr.replace(/\n/g, '\\n');
        serviceAccount = JSON.parse(normalized);
      }
    } catch (finalError: any) {
      console.error('Firebase: Falha crítica ao processar JSON das credenciais:', finalError.message);
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
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      });
      console.log('Firebase: Inicializado com sucesso.');
      return firebaseApp;
    } catch (error: any) {
      console.error('Firebase: Erro na inicialização do Admin SDK:', error.message);
    }
  }

  return null;
}

// Exporta o banco de dados usando um Proxy para garantir que ele seja inicializado sob demanda 
// e forneça erros claros se as variáveis de ambiente falharem.
export const db: Firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    const app = initializeFirebase();
    if (!app) {
      // Retorna null de forma controlada ou explode com erro explicativo
      if (prop === 'collection' || prop === 'doc') {
        throw new Error('Firebase não configurado ou FIREBASE_SERVICE_ACCOUNT_JSON inválido. Verifique o painel da Vercel.');
      }
      return undefined;
    }
    const firestore = getFirestore(app);
    return (firestore as any)[prop];
  }
});

export const getDb = () => db;
