// src/lib/pdf/extract-text.ts
import PDFParser from "pdf2json";

// Tipos para os dados do PDF
interface PDFTextItem {
  T: string;
}

interface PDFTextObject {
  R?: PDFTextItem[];
}

interface PDFPage {
  Texts?: PDFTextObject[];
}

interface PDFData {
  Pages?: PDFPage[];
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!mimeType.includes("pdf")) {
    throw new Error(
      `Tipo de arquivo não suportado: ${mimeType}. Apenas PDFs são aceitos.`
    );
  }

  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser)(null, true); // true = ignora erros de parsing

    pdfParser.on("pdfParser_dataError", (errData: Error | { parserError: Error }) => {
      const errorMessage = errData instanceof Error 
        ? errData.message 
        : errData.parserError.message;
      console.error("Erro no parser PDF:", errorMessage);
      reject(new Error(`Falha ao processar PDF: ${errorMessage}`));
    });

    pdfParser.on("pdfParser_dataReady", () => {
      try {
        let fullText = "";

        // Método robusto: percorre página por página
        const data = pdfParser.data as unknown as PDFData;
        const pages = data?.Pages || [];

        if (!Array.isArray(pages) || pages.length === 0) {
          reject(new Error("PDF não contém páginas válidas ou está vazio."));
          return;
        }

        for (const page of pages) {
          if (page.Texts && Array.isArray(page.Texts)) {
            const pageText = page.Texts.map((textObj: PDFTextObject) => {
              if (textObj.R && Array.isArray(textObj.R)) {
                return textObj.R.map((r: PDFTextItem) => {
                  try {
                    // Decodifica URI component com segurança
                    return decodeURIComponent(r.T || "");
                  } catch {
                    return r.T || "";
                  }
                }).join("");
              }
              return "";
            })
              .filter((text: string) => text.trim().length > 0)
              .join(" ")
              .trim();

            if (pageText) {
              fullText += pageText + "\n\n";
            }
          }
        }

        // Limpeza final
        const cleanText = fullText
          .replace(/\s+/g, " ") // normaliza espaços
          .trim()
          .substring(0, 15000);

        if (cleanText.length < 30) {
          reject(
            new Error(
              "Texto extraído é muito curto ou inválido. O PDF pode estar vazio ou corrompido."
            )
          );
          return;
        }

        console.log(
          `✅ Texto extraído com sucesso: ${cleanText.length} caracteres de ${pages.length} página(s)`
        );
        resolve(cleanText);
      } catch (error) {
        console.error("Erro ao processar PDF:", error);
        reject(
          new Error(
            `Erro ao extrair texto do PDF: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`
          )
        );
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}
