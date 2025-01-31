import { v2 as cloudinary } from 'cloudinary';

// Vérifier que les variables d'environnement sont définies
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Les variables d\'environnement Cloudinary ne sont pas configurées');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'tcg-xprcht/cards',
      format: 'webp',
      transformation: [
        { width: 400, height: 600, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Erreur lors de l\'upload sur Cloudinary:', error);
    throw new Error('Échec de l\'upload de l\'image');
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erreur lors de la suppression sur Cloudinary:', error);
    throw new Error('Échec de la suppression de l\'image');
  }
}; 