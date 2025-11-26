import { z } from "zod";

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
  lectureNumber: z.union([z.number(), z.string()]).nullable().optional().transform(val => {
    if (val === null || val === undefined) return null;
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    return isNaN(num) ? null : num;
  }),
  theme: z.string().nullable().optional(),
});

export async function generateSummary(text: string) {
  const trimmed = text.substring(0, 10000).trim();
  if (trimmed.length < 20) throw new Error("Texto muito curto");

  const prompt = `Você é um professor universitário especializado em ensinar tecnologia. Seu aluno usará este material para se preparar para uma prova.

**IMPORTANTE**: Sua resposta DEVE ser um JSON válido seguindo EXATAMENTE este formato:
{
  "title": "Título claro e descritivo da aula (10-150 caracteres)",
  "summary": "seu resumo completo aqui (mínimo 500 caracteres, máximo 3000)",
  "discipline": "nome da disciplina (ou null se não identificado)",
  "lectureNumber": número da aula (ou null se não identificado),
  "theme": "tema principal da aula (ou null se não identificado)"
}

**Disciplinas do semestre atual**:
- Computação em Nuvem II (cloud computing, AWS, Azure, Docker, Kubernetes, microserviços)
- Processamento de Linguagem Natural (PLN, NLP, análise de texto, transformers, BERT, GPT)
- Qualidade e Testes de Software (testes unitários, integração, QA, automação)
- Mineração de Dados (data mining, machine learning, classificação, clustering)
- Ética Profissional e Patente (ética, propriedade intelectual, LGPD)

**Regras para o título**:
- Deve ser claro, descritivo e profissional
- Deve capturar o tema principal da aula
- Use título de caso (capitalize palavras importantes)
- Exemplos: "Introdução aos Containers e Docker", "Fundamentos de Machine Learning", "Testes Unitários com Jest"
- NÃO use o nome do arquivo, crie um título baseado no conteúdo

O campo "summary" é OBRIGATÓRIO e deve conter um resumo **completo, técnico e didático** com NO MÁXIMO 3000 caracteres:

**Estrutura obrigatória do resumo**:
1. **Contexto**: Por que este tema é importante na disciplina?
2. **Conceitos-chave**: Defina os termos técnicos com clareza.
3. **Exemplos práticos**: Inclua pelo menos **dois exemplos concretos** (pseudocódigo, código real, analogias ou casos de uso).
4. **Aplicação**: Como isso é usado no mundo real ou em projetos acadêmicos?
5. **Erro comum**: Qual é o principal equívoco dos alunos sobre este tema?
6. **Resumo final**: Uma síntese para memorização rápida.

**Regras de estilo**:
- Use **linguagem clara, mas técnica** (ex: "estrutura condicional", não "coisa que decide").
- Em português do Brasil, com termos acadêmicos corretos.
- Se houver código, use **pseudocódigo estruturado** ou **Python/JavaScript** (linguagens mais usadas no curso).
- Identifique corretamente a disciplina baseando-se no conteúdo e nas disciplinas listadas acima.
- Não invente informações — baseie-se **exclusivamente** no texto fornecido.
- **IMPORTANTE**: Mantenha o resumo dentro do limite de 3000 caracteres. Seja conciso mas completo.

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
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
        max_tokens: 2048,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq falhou: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log("AI Response:", content);
  
  const parsed = JSON.parse(content);
  console.log("Parsed JSON:", parsed);
  
  // Truncar summary se exceder o limite
  if (parsed.summary && parsed.summary.length > 3500) {
    console.warn(`Summary truncado de ${parsed.summary.length} para 3500 caracteres`);
    parsed.summary = parsed.summary.substring(0, 3497) + '...';
  }
  
  return AISummarySchema.parse(parsed);
}
