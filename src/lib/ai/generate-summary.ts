import { z } from "zod";

// Função auxiliar para delay
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const AISummarySchema = z.object({
  title: z
    .string()
    .min(10, "Título muito curto")
    .max(150, "Título muito longo"),
  summary: z
    .string()
    .min(
      500,
      "Resumo muito curto — deve conter exemplos e explicações completas"
    )
    .max(3500),
  discipline: z.string().nullable().optional(),
  lectureNumber: z
    .union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? null : num;
    }),
  theme: z.string().nullable().optional(),
});

export async function generateSummary(text: string, retryCount = 0): Promise<z.infer<typeof AISummarySchema>> {
  const trimmed = text.substring(0, 10000).trim();
  if (trimmed.length < 20) throw new Error("Texto muito curto");

  const MAX_RETRIES = 3;
  const BASE_DELAY = 15000; // 15 segundos

const prompt = `Você é um professor universitário especializado em ensinar tecnologia. Seu aluno usará este material para se preparar para uma prova.

Retorne sua resposta em formato JSON com os seguintes campos: "title", "summary", "discipline", "lectureNumber", "theme".

O campo "summary" DEVE seguir EXATAMENTE o seguinte padrão narrativo (em português do Brasil):

> **Introdução**  
> [Frase de abertura que define o tema central com clareza]. Nesta aula, vamos explorar [principais tópicos], que são fundamentais na disciplina de [disciplina]. [Explicação breve do porquê esses conceitos são importantes]. Além disso, vamos discutir [outro conceito-chave], que [descreva sua função ou relevância]. Vamos explorar esses temas e sua aplicação através de exemplos práticos.

> **Contexto**: [1–2 frases sobre relevância acadêmica e profissional.]

> **Conceitos-chave**: [Liste os conceitos com frases completas, não apenas títulos.]

> **Exemplos práticos**: [Descreva dois exemplos concretos: um teórico (ex: fórmula, pseudocódigo) e um aplicado (ex: caso real).]

> **Aplicação**: [Explique como é usado no mercado ou em projetos reais.]

> **Erro comum**: [Identifique e corrija um equívoco comum dos alunos.]

> **Resumo final**: Em resumo, [reafirme o valor central], destacando que [conceitos] são essenciais para [objetivo]. Entender [ponto crítico] é fundamental para aplicar esses conceitos de forma correta.

Baseie-se EXCLUSIVAMENTE no texto fornecido. Não invente exemplos que não possam ser inferidos do conteúdo. Use termos técnicos corretos (ex: "probabilidade condicional", não "chance de algo acontecer").

**Texto da aula**:
${trimmed}`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
        max_tokens: 2048,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    
    // Verificar se é erro de rate limit
    if (err.includes('rate_limit_exceeded') && retryCount < MAX_RETRIES) {
      // Extrair tempo de espera do erro, se disponível
      const waitMatch = err.match(/try again in ([\d.]+)s/);
      const waitTime = waitMatch ? Math.ceil(parseFloat(waitMatch[1]) * 1000) : BASE_DELAY;
      
      console.log(`Rate limit atingido. Aguardando ${waitTime / 1000}s antes de tentar novamente (tentativa ${retryCount + 1}/${MAX_RETRIES})...`);
      await sleep(waitTime + 1000); // Adicionar 1s extra de margem
      
      return generateSummary(text, retryCount + 1);
    }
    
    throw new Error(`Groq falhou: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  console.log("AI Response (raw):", content);

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (parseError) {
    console.error("Erro ao fazer parse do JSON:", parseError);
    throw new Error(`JSON inválido da IA: ${parseError}`);
  }

  console.log("Parsed JSON (full):", JSON.stringify(parsed, null, 2));
  console.log("Campos disponíveis:", Object.keys(parsed));
  console.log("Tipo do summary:", typeof parsed.summary);
  console.log("Conteúdo do summary:", parsed.summary);

  // Garantir que summary seja string
  if (parsed.summary && typeof parsed.summary === 'object') {
    console.warn('Summary veio como objeto, convertendo para string');
    // Se for array, juntar os elementos
    if (Array.isArray(parsed.summary)) {
      parsed.summary = parsed.summary.join('\n\n');
    } else {
      // Se for objeto com propriedades, tentar extrair o texto
      const summaryObj = parsed.summary as Record<string, unknown>;
      if (summaryObj.text || summaryObj.content) {
        parsed.summary = String(summaryObj.text || summaryObj.content);
      } else {
        // Último recurso: stringificar o objeto
        parsed.summary = JSON.stringify(parsed.summary);
      }
    }
  }

  // Se summary não existir, tentar buscar em outros campos comuns
  if (!parsed.summary) {
    console.warn('Campo summary não encontrado, buscando alternativas...');
    parsed.summary = parsed.resumo || parsed.content || parsed.text || '';
  }

  // Validar se agora é string
  if (!parsed.summary || typeof parsed.summary !== 'string') {
    console.error('Summary ainda inválido após tentativas de correção');
    console.error('Objeto parsed completo:', JSON.stringify(parsed, null, 2));
    throw new Error(`AI retornou summary em formato inválido. Tipo recebido: ${typeof parsed.summary}`);
  }

  // Truncar summary se exceder o limite
  if (parsed.summary.length > 3500) {
    console.warn(
      `Summary truncado de ${parsed.summary.length} para 3500 caracteres`
    );
    parsed.summary = parsed.summary.substring(0, 3497) + "...";
  }

  return AISummarySchema.parse(parsed);
}
