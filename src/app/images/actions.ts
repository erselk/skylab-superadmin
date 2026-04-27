'use server';

export async function uploadImage(formData: FormData) {
  void formData;
  throw new Error('Resim yukleme endpointi backend API sozlesmesinde bulunmuyor');
}

export async function deleteImage(imageId: string) {
  void imageId;
  throw new Error('Resim silme endpointi backend API sozlesmesinde bulunmuyor');
}
