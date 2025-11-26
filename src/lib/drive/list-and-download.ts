import { google } from 'googleapis';
import { auth } from './auth';

export async function listFilesInFolder(folderId: string) {
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
  });
  return res.data.files || [];
}

export async function downloadFile(fileId: string) {
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  const chunks: Buffer[] = [];
  for await (const chunk of res.data) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Pega o mimeType
  const meta = await drive.files.get({ fileId, fields: 'mimeType' });
  return { buffer, mimeType: meta.data.mimeType! };
}