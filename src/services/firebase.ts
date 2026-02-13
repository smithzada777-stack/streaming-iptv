// Firebase usando API REST (sem firebase-admin para evitar problemas de JSON)
// Baseado nas instruções do INSTRUCOES_PIX.md

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'redflix-iptv-3d47b';
const FIRESTORE_API_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

interface FirestoreDocument {
  fields: Record<string, any>;
}

function toFirestoreValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

function fromFirestoreValue(value: any): any {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.mapValue?.fields) {
    const obj: Record<string, any> = {};
    for (const [k, v] of Object.entries(value.mapValue.fields)) {
      obj[k] = fromFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

export const db = {
  collection: (collectionName: string) => ({
    doc: (docId: string) => ({
      set: async (data: Record<string, any>) => {
        const fields: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          fields[key] = toFirestoreValue(value);
        }

        const response = await fetch(
          `${FIRESTORE_API_BASE}/${collectionName}/${docId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
          }
        );

        if (!response.ok) {
          throw new Error(`Firestore set failed: ${response.statusText}`);
        }
        return response.json();
      },

      get: async () => {
        const response = await fetch(
          `${FIRESTORE_API_BASE}/${collectionName}/${docId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return { exists: false, data: () => null };
          }
          throw new Error(`Firestore get failed: ${response.statusText}`);
        }

        const doc = await response.json();
        const data: Record<string, any> = {};
        if (doc.fields) {
          for (const [key, value] of Object.entries(doc.fields)) {
            data[key] = fromFirestoreValue(value);
          }
        }

        return {
          exists: true,
          data: () => data,
        };
      },

      update: async (data: Record<string, any>) => {
        const fields: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          fields[key] = toFirestoreValue(value);
        }

        const response = await fetch(
          `${FIRESTORE_API_BASE}/${collectionName}/${docId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
          }
        );

        if (!response.ok) {
          throw new Error(`Firestore update failed: ${response.statusText}`);
        }
        return response.json();
      },
    }),

    where: (field: string, op: string, value: any) => ({
      get: async () => {
        // Para queries simples, vamos fazer um scan (não ideal mas funciona)
        const response = await fetch(
          `${FIRESTORE_API_BASE}/${collectionName}`
        );

        if (!response.ok) {
          throw new Error(`Firestore query failed: ${response.statusText}`);
        }

        const result = await response.json();
        const docs = (result.documents || [])
          .map((doc: any) => {
            const data: Record<string, any> = {};
            if (doc.fields) {
              for (const [key, val] of Object.entries(doc.fields)) {
                data[key] = fromFirestoreValue(val);
              }
            }
            return {
              id: doc.name.split('/').pop(),
              data: () => data,
            };
          })
          .filter((doc: any) => {
            const docData = doc.data();
            if (op === '==') return docData[field] === value;
            return false;
          });

        return { docs, empty: docs.length === 0 };
      },
    }),
  }),
};

export const getDb = () => db;
