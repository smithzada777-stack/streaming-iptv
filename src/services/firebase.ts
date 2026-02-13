import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let serviceAccount = null;

try {
  let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '';

  // Remove accidental wrapping quotes
  if (serviceAccountStr.startsWith("'") && serviceAccountStr.endsWith("'")) {
    serviceAccountStr = serviceAccountStr.slice(1, -1);
  }

  if (serviceAccountStr) {
    serviceAccount = JSON.parse(serviceAccountStr);
  } else {
    // Tenta carregar do arquivo local se a variável estiver vazia
    const localFile = path.resolve(process.cwd(), 'redflix-iptv-3d47b-firebase-adminsdk-fbsvc-ca8f0cd6f6.json');
    if (fs.existsSync(localFile)) {
      serviceAccount = JSON.parse(fs.readFileSync(localFile, 'utf8'));
    }
  }
} catch (error) {
  console.warn('Aviso: Falha ao processar FIREBASE_SERVICE_ACCOUNT_JSON das variáveis de ambiente. Tentando arquivo local...');
  try {
    const localFile = path.resolve(process.cwd(), 'redflix-iptv-3d47b-firebase-adminsdk-fbsvc-ca8f0cd6f6.json');
    if (fs.existsSync(localFile)) {
      serviceAccount = JSON.parse(fs.readFileSync(localFile, 'utf8'));
    }
  } catch (innerError) {
    console.error('Erro crítico: Não foi possível carregar as credenciais do Firebase.', innerError);
  }
}

if (!getApps().length && serviceAccount) {
  // Fix literal \n se necessário
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  try {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
  }
}

export const db = getFirestore();
