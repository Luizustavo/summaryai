import client, { DATABASE_NAME } from './client';

interface FAQEntryInput {
  title: string;
  summary: string;
  source: {
    driveFileId: string;
    fileName: string;
    mimeType: string;
  };
  meta: {
    discipline: string;
    lectureNumber?: number;
    theme?: string;
  };
}

export async function createFAQEntry(entry: FAQEntryInput) {
  const db = client.db(DATABASE_NAME);
  await db.collection('faqEntries').insertOne({
    ...entry,
    createdAt: new Date(),
  });
}

export async function getFAQEntries() {
  const db = client.db(DATABASE_NAME);
  const entries = await db.collection('faqEntries').find().sort({ createdAt: -1 }).toArray();
  return entries;
}

export async function isFileProcessed(driveFileId: string): Promise<boolean> {
  const db = client.db(DATABASE_NAME);
  const existing = await db.collection('faqEntries').findOne({
    'source.driveFileId': driveFileId,
  });
  return !!existing;
}