import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

/**
 * Uploads a file to S3 storage
 * @param {File} file - The file to upload
 * @param {string} path - The path where the file should be stored (e.g., 'vehicles/123/documents')
 * @returns {Promise<string>} The URL of the uploaded file
 */
export async function uploadFile(file, path) {
  try {
    // For local development, return a mock URL
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Simulating file upload: ${path}/${file.name}`);
      return `https://example.com/${path}/${file.name}`;
    }

    // In production, upload to S3
    const fileExtension = file.name.split('.').pop();
    const key = `${path}/${uuidv4()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);
    
    // Generate a presigned URL for the uploaded file
    const url = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    }));

    return url;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Deletes a file from storage
 * @param {string} url - The URL of the file to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
export async function deleteFile(url) {
  try {
    // For local development, log the deletion
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Simulating file deletion: ${url}`);
      return true;
    }

    // In production, delete from S3
    const key = url.split('/').slice(3).join('/').split('?')[0];
    
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    }));

    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
}

/**
 * Handles file uploads to the server's filesystem (for development)
 * @param {File} file - The file to upload
 * @param {string} path - The path where the file should be stored
 * @returns {Promise<string>} The public URL of the uploaded file
 */
async function uploadToLocalFS(file, path) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = Buffer.from(e.target.result);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `./public/uploads/${path}`;
      
      // In a real implementation, you would save the file to the filesystem here
      // For now, we'll just return a mock URL
      setTimeout(() => {
        resolve(`/uploads/${path}/${fileName}`);
      }, 500);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
