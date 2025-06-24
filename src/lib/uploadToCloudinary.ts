import api from './api';

/**
 * Upload any file to Cloudinary and save to Document DB via backend endpoint. Returns the Document DB object.
 * @param file File to upload
 * @param childId Child ID
 * @param name File name
 * @param fileType File type (extension)
 * @param size File size (string, e.g. '2.4 MB')
 * @param type Document type (school, health, personal, other)
 * @returns Document DB object
 */
export async function uploadToCloudinary(
  file: File,
  childId: string,
  name: string,
  fileType: string,
  size: string,
  type: string = 'other'
) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('childId', childId);
  formData.append('name', name);
  formData.append('fileType', fileType);
  formData.append('size', size);
  formData.append('type', type);
  const res = await api.post('/record/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!res.data?._id || !res.data?.url) throw new Error('Upload failed: No Document DB object returned');
  return res.data;
}
