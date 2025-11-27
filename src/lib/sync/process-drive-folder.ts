import { listFilesInFolder, downloadFile } from "@/lib/drive/list-and-download";
import { extractTextFromBuffer } from "@/lib/pdf/extract-text";
import { generateSummary } from "@/lib/ai/generate-summary";
import { createFAQEntry, isFileProcessed } from "@/lib/db/faq-entries";

// Delay entre processamentos para respeitar rate limit
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processDriveFolder() {
  const folderId = process.env.DRIVE_FOLDER_ID!;
  const files = await listFilesInFolder(folderId);

  const unprocessedFiles = [];
  for (const file of files) {
    if (!file.id) continue;
    if (await isFileProcessed(file.id)) {
      console.log(`✓ Arquivo já processado: ${file.name}`);
      continue;
    }
    unprocessedFiles.push(file);
  }

  console.log(`\n📁 Total de arquivos: ${files.length}`);
  console.log(`✅ Já processados: ${files.length - unprocessedFiles.length}`);
  console.log(`⏳ Aguardando processamento: ${unprocessedFiles.length}\n`);

  if (unprocessedFiles.length === 0) {
    console.log('Nenhum arquivo novo para processar.');
    return { processed: 0, total: files.length };
  }

  let processedCount = 0;
  const DELAY_BETWEEN_FILES = 3000; // 3 segundos entre cada arquivo

  for (let i = 0; i < unprocessedFiles.length; i++) {
    const file = unprocessedFiles[i];
    
    try {
      console.log(`\n[${i + 1}/${unprocessedFiles.length}] Processando: ${file.name}`);
      
      const { buffer, mimeType } = await downloadFile(file.id!);
      const text = await extractTextFromBuffer(buffer, mimeType);
      
      console.log(`📝 Texto extraído (${text.length} caracteres), gerando resumo...`);
      const aiResult = await generateSummary(text);

      await createFAQEntry({
        title: aiResult.title,
        summary: aiResult.summary,
        source: {
          driveFileId: file.id!,
          fileName: file.name ?? "",
          mimeType,
        },
        meta: {
          discipline: String(aiResult.discipline || ''),
          lectureNumber: Number(aiResult.lectureNumber) || undefined,
          theme: String(aiResult.theme || ''),
        },
      });

      processedCount++;
      console.log(`✅ Arquivo processado com sucesso: ${file.name}`);

      // Delay entre arquivos (exceto no último)
      if (i < unprocessedFiles.length - 1) {
        console.log(`⏱️  Aguardando ${DELAY_BETWEEN_FILES / 1000}s antes do próximo arquivo...`);
        await sleep(DELAY_BETWEEN_FILES);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${file.name}:`, error);
      // Continuar com próximo arquivo mesmo se um falhar
      if (i < unprocessedFiles.length - 1) {
        console.log(`⏱️  Aguardando ${DELAY_BETWEEN_FILES / 1000}s antes de tentar o próximo...`);
        await sleep(DELAY_BETWEEN_FILES);
      }
    }
  }

  console.log(`\n\n🎉 Processamento concluído!`);
  console.log(`✅ Arquivos processados: ${processedCount}/${unprocessedFiles.length}`);
  
  return { processed: processedCount, total: unprocessedFiles.length };
}
