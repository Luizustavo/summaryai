// src/lib/pdf/extract-text.ts
import PDFParser from 'pdf2json';

export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (!mimeType.includes('pdf')) {
    throw new Error(`Tipo de arquivo não suportado: ${mimeType}. Apenas PDFs são aceitos.`);
  }

  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, true); // true = ignora erros de parsing

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('Erro no parser PDF:', errData.parserError);
      reject(new Error(`Falha ao processar PDF: ${errData.parserError}`));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        // ✅ Extrai texto de forma mais confiável
        let fullText = '';
        const pdfData = pdfParser.getRawTextContent();
        
        // Método alternativo mais robusto: percorre página por página
        const pages = pdfParser ? pdfParser.data.Pages : [];
        for (const page of pages) {
          if (page.Texts && Array.isArray(page.Texts)) {
            const pageText = page.Texts
              .map((textObj: any) => {
                if (textObj.R && Array.isArray(textObj.R)) {
                  return textObj.R.map((r: any) => r.T || '').join('');
                }
                return textObj.T || '';
              })
              .join(' ')
              .replace(/\x00/g, '') // remove caracteres nulos
              .trim();
            if (pageText) fullText += pageText + '\n';
          }
        }

        // Fallback: se o método detalhado falhar, usa getRawTextContent()
        if (!fullText.trim()) {
          fullText = pdfData || '';
        }

        // Limpeza final
        const cleanText = fullText
          .replace(/\s+/g, ' ') // normaliza espaços
          .replace(/[^\x20-\x7E\xA0-\xFF]/g, '') // remove caracteres não imprimíveis (opcional)
          .trim()
          .substring(0, 15000);

        if (cleanText.length < 30) {
          reject(new Error('Texto extraído é muito curto ou inválido.'));
        }

        resolve(cleanText);
      } catch (error) {
        console.error('Erro ao processar PDF:', error);
        reject(new Error('Erro inesperado ao extrair texto do PDF.'));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}