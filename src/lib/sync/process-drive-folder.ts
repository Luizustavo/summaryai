import { listFilesInFolder, downloadFile } from "@/lib/drive/list-and-download";
import { extractTextFromBuffer } from "@/lib/pdf/extract-text";
import { generateSummary } from "@/lib/ai/generate-summary";
import { createFAQEntry, isFileProcessed } from "@/lib/db/faq-entries";

export async function processDriveFolder() {
  const folderId = process.env.DRIVE_FOLDER_ID!;
  const files = await listFilesInFolder(folderId);

  for (const file of files) {
    if (!file.id) continue;
    if (await isFileProcessed(file.id)) continue;

    console.log(`Processando: ${file.name}`);
    const { buffer, mimeType } = await downloadFile(file.id);
    const text = await extractTextFromBuffer(buffer, mimeType);
    const aiResult = await generateSummary(text);

    await createFAQEntry({
      title: aiResult.title,
      summary: aiResult.summary,
      source: {
        driveFileId: file.id,
        fileName: file.name ?? "",
        mimeType,
      },
      meta: {
        discipline: String(aiResult.discipline),
        lectureNumber: Number(aiResult.lectureNumber),
        theme: String(aiResult.theme),
      },
    });
  }
}
