import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!
});

const BUCKET_NAME = 'tcg-cards';

export async function uploadCardImage(file: File, cardId: number): Promise<string> {
  const path = `cards/${cardId}.jpg`;
  await minioClient.putObject(BUCKET_NAME, path, file);
  return `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${path}`;
}

export async function deleteCardImage(cardId: number): Promise<void> {
  const path = `cards/${cardId}.jpg`;
  await minioClient.removeObject(BUCKET_NAME, path);
}

// Fonction utilitaire pour vérifier si une image existe
export async function cardImageExists(cardId: number): Promise<boolean> {
  try {
    const path = `cards/${cardId}.jpg`;
    await minioClient.statObject(BUCKET_NAME, path);
    return true;
  } catch {
    return false;
  }
} 