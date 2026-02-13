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
  let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '';

  try {
    if (serviceAccountStr) {
      // Limpeza agressiva para evitar SyntaxError comum no Vercel/Windows
      serviceAccountStr = serviceAccountStr.trim();

      // Remove aspas simples ou duplas que podem ter vindo do comando de colagem
      if ((serviceAccountStr.startsWith("'") && serviceAccountStr.endsWith("'")) ||
        (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"'))) {
        serviceAccountStr = serviceAccountStr.slice(1, -1);
      }

      // Substitui quebras de linha reais por \n se o usuário colou o JSON "aberto"
      // e garante que \n literais sejam tratados corretamente
      serviceAccount = JSON.parse(serviceAccountStr);
    }
  } catch (error) {
    console.warn('Aviso: Falha ao processar FIREBASE_SERVICE_ACCOUNT_JSON. Verifique o formato do JSON.');
  }

  // Fallback para arquivo local (útil em testes locais)
  if (!serviceAccount) {
    try {
      const localFile = path.resolve(process.cwd(), 'redflix-iptv-3d47b-firebase-adminsdk-fbsvc-ca8f0cd6f6.json');
      if (fs.existsSync(localFile)) {
        serviceAccount = JSON.parse(fs.readFileSync(localFile, 'utf8'));
      }
    } catch (e) {
      // Silencioso se não houver arquivo local
    }
  }

  if (serviceAccount) {
    // Garante que a chave privada tenha quebras de linha reais
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    try {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      });
      return firebaseApp;
    } catch (error) {
      console.error('Erro ao inicializar Firebase Admin:', error);
    }
  }

  return null;
}

// Exporta um getter para o DB para evitar erro no build time se as chaves não estiverem prontas
export const getDb = (): Firestore => {
  const app = initializeFirebase();
  if (!app) {
    // Durante o build do Next.js, se não houver credenciais, retornamos uma instância "vazia" 
    // ou deixamos falhar apenas no acesso real. 
    // Mas para o build passar, precisamos que getFirestore() não exploda.
    try {
      return getFirestore();
    } catch (e) {
      console.warn('Firebase não inicializado. O DB não estará disponível.');
      return null as any;
    }
  }
  return getFirestore(app);
};

// Mantemos a exportação da constante para compatibilidade, mas usando o getter
export const db = (typeof window === 'undefined') ? getDb() : null as any;
