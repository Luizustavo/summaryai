# 📚 SummaryAI

Sistema inteligente de geração automática de resumos acadêmicos a partir de arquivos PDF armazenados no Google Drive, utilizando IA para criar conteúdo estruturado e organizado.

## 🎯 Visão Geral

O **SummaryAI** é uma aplicação Next.js que automatiza o processo de:
1. **Extração** de arquivos PDF do Google Drive
2. **Processamento** do conteúdo dos PDFs
3. **Geração** de títulos e resumos inteligentes usando IA (Groq/LLaMA 3.1)
4. **Armazenamento** estruturado no MongoDB
5. **Visualização** em interface web moderna, clean e profissional

## ✨ Funcionalidades

### 🤖 Processamento Inteligente com IA
- Extração automática de texto de arquivos PDF
- **Geração de títulos descritivos** baseados no conteúdo (não usa nome do arquivo)
- Geração de resumos acadêmicos completos e estruturados usando IA (LLaMA 3.1 8B)
- Identificação automática de disciplina, número da aula e tema
- Categorização inteligente por área de conhecimento
- Deduplicação automática (não processa o mesmo arquivo duas vezes)
- Validação robusta com truncamento automático de textos longos

### 🎨 Interface Moderna e Profissional
- Design clean inspirado em grandes marcas (Nike)
- Fundo branco minimalista com tipografia clara
- Layout responsivo com Tailwind CSS 4
- Categorização visual por disciplinas do semestre:
  - **Computação em Nuvem II** (slate-900)
  - **Processamento de Linguagem Natural** (violet-900)
  - **Qualidade e Testes de Software** (emerald-900)
  - **Mineração de Dados** (amber-900)
  - **Ética Profissional e Patente** (indigo-900)
  - **Outros** (gray-900)
- Sistema de busca em tempo real
- Filtros por categoria com contadores
- Ordenação por data ou alfabética
- Cards com hover states elegantes
- Modal com texto justificado e formatação acadêmica
- Header sticky com controles acessíveis

### 🔄 Sincronização Manual
- Botão "Sincronizar" no header com animação de loading
- Integração direta com Google Drive API
- Feedback visual durante processamento
- Recarregamento automático após sincronização
- Mensagens de sucesso/erro amigáveis

## 🛠️ Tecnologias

### Core
- **Next.js 16** - Framework React com App Router
- **TypeScript 5** - Type safety
- **React 19** - UI Library

### Banco de Dados
- **MongoDB 7** - Armazenamento de resumos
- Database: `faqdb`
- Collection: `faqEntries`

### IA & Processamento
- **Groq API** - Inferência de IA (LLaMA 3.1 8B Instant)
- **pdf2json 4** - Extração de texto de PDFs
- **Zod 4** - Validação de schemas e transformação de dados

### Cloud & APIs
- **Google Drive API** - Acesso a arquivos do Drive
- **googleapis 166** - Cliente Node.js para Google APIs

### Estilo & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - Processamento CSS
- Design minimalista e profissional
- Tipografia system fonts para melhor legibilidade

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (ou npm/yarn)
- Conta Google Cloud com Drive API habilitada
- Conta Groq AI com API key
- MongoDB (local ou Atlas)

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd summaryai
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/faqdb
# ou para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/faqdb

# Google Drive API
GOOGLE_CLIENT_EMAIL=seu-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
DRIVE_FOLDER_ID=id-da-pasta-do-google-drive

# Groq AI
GROQ_API_KEY=sua-groq-api-key
```

### 4. Configure o Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou use um existente
3. Habilite a **Google Drive API**
4. Crie uma **Service Account**
5. Gere e baixe a chave JSON
6. Compartilhe a pasta do Drive com o email da service account

### 5. Execute em desenvolvimento
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
summaryai/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Página principal (listagem)
│   │   ├── layout.tsx               # Layout global
│   │   ├── globals.css              # Estilos globais
│   │   └── api/
│   │       ├── faq/
│   │       │   └── route.ts         # API: listar resumos
│   │       └── cron/
│   │           └── sync-drive/
│   │               └── route.ts     # API: sincronizar Drive
│   ├── lib/
│   │   ├── ai/
│   │   │   └── generate-summary.ts  # Geração de resumos com IA
│   │   ├── db/
│   │   │   ├── client.ts            # Cliente MongoDB
│   │   │   └── faq-entries.ts       # CRUD de resumos
│   │   ├── drive/
│   │   │   ├── auth.ts              # Autenticação Google
│   │   │   └── list-and-download.ts # Operações Drive
│   │   ├── pdf/
│   │   │   └── extract-text.ts      # Extração de texto PDF
│   │   └── sync/
│   │       └── process-drive-folder.ts # Lógica de sincronização
│   └── ...
├── public/                           # Arquivos estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🔄 Como Funciona

### Fluxo de Processamento

1. **Trigger**: Chamada manual ao endpoint `/api/cron/sync-drive` via botão na interface
2. **Listagem**: Busca arquivos PDF na pasta do Google Drive
3. **Verificação**: Checa se o arquivo já foi processado (deduplicação)
4. **Download**: Baixa o conteúdo do PDF
5. **Extração**: Converte PDF em texto usando pdf2json
6. **IA**: Envia texto para Groq API (LLaMA) para gerar resumo estruturado
7. **Armazenamento**: Salva no MongoDB (database `faqdb`)
8. **Visualização**: Interface lista e categoriza automaticamente

### 🔄 Sincronização com Google Drive

A aplicação oferece **sincronização automática e manual** com o Google Drive:

**Sincronização Manual:**
- Botão "Sincronizar" disponível no header
- Ícone de refresh que anima durante processamento
- Chama a rota `/api/cron/sync-drive`
- Recarrega automaticamente a lista após sincronização
- Exibe mensagem de sucesso/erro
- Ideal para atualizar a biblioteca quando novos arquivos são adicionados ao Drive

**Como usar:**
1. Adicione arquivos PDF na pasta configurada do Google Drive
2. Acesse a aplicação web
3. Clique no botão "Sincronizar" no canto superior direito
4. Aguarde o processamento (pode demorar alguns segundos)
5. Os novos resumos aparecerão automaticamente na lista

### Modelo de Dados

```typescript
{
  _id: ObjectId,
  title: string,                    // Título gerado pela IA (descritivo e legível)
  summary: string,                  // Resumo completo gerado pela IA (500-3500 chars)
  source: {
    driveFileId: string,           // ID único do arquivo no Google Drive
    fileName: string,              // Nome original do arquivo (para referência)
    mimeType: string              // Tipo MIME do arquivo
  },
  meta: {
    discipline: string,            // Disciplina identificada pela IA
    lectureNumber: number,         // Número da aula (quando identificado)
    theme: string                  // Tema principal da aula
  },
  createdAt: Date                   // Data de criação do registro
}
```

### Prompt da IA

O sistema utiliza um prompt estruturado que instrui a IA a gerar:
- **Título profissional**: Claro, descritivo e baseado no conteúdo (não no nome do arquivo)
- **Resumo acadêmico completo** com estrutura obrigatória:
  1. Contexto e importância do tema
  2. Conceitos-chave com definições técnicas
  3. Exemplos práticos (pseudocódigo ou código real)
  4. Aplicações no mundo real
  5. Erros comuns dos alunos
  6. Síntese final para memorização
- **Identificação automática** da disciplina do semestre
- **Extração** do número da aula e tema principal

## 🎨 Interface do Usuário

### Design Clean e Profissional
Inspirado em grandes marcas como Nike, o design prioriza:
- **Minimalismo**: Fundo branco, sem gradientes excessivos
- **Tipografia clara**: System fonts com hierarquia visual bem definida
- **Sem emojis em excesso**: Apenas cores e texto limpo
- **Espaçamento generoso**: Respiro visual adequado
- **Interações sutis**: Hover states com bordas, sem sombras excessivas

### Página Principal
- Header sticky com título, contador e controles
- **Botão de sincronização** com ícone animado
- Campo de busca minimalista
- Filtros em pills horizontais (scrolláveis no mobile)
- Grid responsivo de cards (1-3 colunas)
- Cards com:
  - Header colorido por categoria (altura 48)
  - Título em negrito com hover underline
  - Preview do resumo (3 linhas)
  - Footer com disciplina e data

### Modal de Detalhes
- Fundo branco limpo
- Header com:
  - Badge da categoria
  - Título em destaque
  - Metadados (disciplina, aula, tema, data)
  - Nome do arquivo original (fonte mono, discreto)
- Conteúdo:
  - Texto justificado com line-height generoso
  - Espaçamento aumentado entre parágrafos (1.75em)
  - Formatação prose para elementos técnicos
  - Scrollável para textos longos
- Botão de fechar minimalista (preto sólido)

### Categorias Automáticas
- **Computação em Nuvem II** (slate): Cloud, AWS, Azure, Docker, Kubernetes
- **Processamento de Linguagem Natural** (violet): PLN, NLP, transformers, BERT, GPT
- **Qualidade e Testes de Software** (emerald): Testes unitários, QA, automação
- **Mineração de Dados** (amber): Data mining, machine learning, classificação
- **Ética Profissional e Patente** (indigo): Ética, propriedade intelectual, LGPD
- **Outros** (gray): Não classificados

## 🔐 Segurança

- Variáveis de ambiente para credenciais sensíveis
- Service Account do Google (sem necessidade de OAuth)
- Validação de tipos com Zod e TypeScript
- Sanitização de dados de entrada
- Error handling em todas as camadas

## 📊 API Endpoints

### `GET /api/faq`
Lista todos os resumos cadastrados ordenados por data de criação (mais recentes primeiro).

**Response:**
```json
[
  {
    "_id": "674...",
    "title": "Introdução aos Containers e Docker",
    "summary": "Este tema é fundamental na disciplina de Computação em Nuvem...",
    "meta": {
      "discipline": "Computação em Nuvem II",
      "lectureNumber": 3,
      "theme": "Containerização e Orquestração"
    },
    "source": {
      "fileName": "aula-03-docker.pdf"
    },
    "createdAt": "2025-11-26T10:30:00.000Z"
  }
]
```

### `GET /api/cron/sync-drive`
Sincroniza arquivos do Google Drive e processa novos PDFs.

**Funcionamento:**
1. Lista todos os arquivos PDF na pasta configurada do Drive
2. Verifica quais já foram processados (deduplicação por `driveFileId`)
3. Para cada arquivo novo:
   - Faz download do conteúdo
   - Extrai texto do PDF
   - Envia para IA gerar título e resumo
   - Salva no MongoDB
4. Retorna sucesso ou erro

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Sincronização concluída com sucesso!"
}
```

**Response (Erro):**
```json
{
  "error": "Mensagem de erro específica"
}
```

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar produção
pnpm start

# Lint
pnpm lint
```

## 🐛 Troubleshooting

### Erro ao conectar no MongoDB
- Verifique se o MongoDB está rodando localmente na porta 27017
- Confirme a string de conexão no `.env.local`
- Para MongoDB Atlas:
  - Verifique whitelist de IPs (adicione 0.0.0.0/0 para permitir todos)
  - Confirme usuário e senha
  - Verifique se o cluster está ativo

### Erro ao acessar Google Drive
- Confirme as credenciais da Service Account no `.env.local`
- Verifique se a pasta foi compartilhada com o email da service account
- Valide o `DRIVE_FOLDER_ID` (encontrado na URL da pasta)
- Certifique-se de que a Google Drive API está habilitada no projeto

### Erro ao extrair texto do PDF
- Certifique-se de que o arquivo é um PDF válido (não corrompido)
- PDFs escaneados (imagens) não funcionam sem OCR
- Verifique os logs no terminal para detalhes do erro
- Tente abrir o PDF manualmente para verificar se está legível

### Erro na geração de resumo (Groq)
- Valide a `GROQ_API_KEY` no `.env.local`
- Verifique limites de rate da API Groq (pode ter atingido o limite)
- Confirme que o texto extraído não está vazio
- Verifique se o modelo `llama-3.1-8b-instant` está disponível

### Erro "Unauthorized" na sincronização
- Este erro foi corrigido - a rota não requer mais autenticação
- Se persistir, verifique se há cache do navegador e faça hard refresh (Ctrl+Shift+R)

### Summary muito longo (erro de validação)
- O sistema trunca automaticamente resumos maiores que 3500 caracteres
- Se o erro persistir, verifique os logs da IA
- Pode indicar problema no prompt ou modelo da IA

### lectureNumber com tipo errado
- O sistema converte automaticamente strings para números
- Se o erro persistir, verifique o retorno da IA no console

## 📝 Roadmap

- [ ] Suporte a OCR para PDFs escaneados (Tesseract.js)
- [ ] Upload direto de arquivos pela interface
- [ ] Exportação de resumos (PDF, Markdown, DOCX)
- [ ] Sistema de favoritos
- [ ] Modo escuro
- [ ] Busca avançada com filtros combinados
- [ ] Estatísticas e analytics (resumos mais vistos, etc)
- [ ] Integração com Notion/Obsidian
- [ ] Compartilhamento de resumos via link
- [ ] Comentários e anotações nos resumos
- [ ] Testes automatizados (Jest, Playwright)

## 🚀 Deploy na Vercel

### Pré-requisitos
- Conta na Vercel (gratuita)
- Repositório no GitHub
- MongoDB Atlas (ou outro MongoDB na nuvem)

### Passos

1. **Commit e Push**
   ```bash
   git add .
   git commit -m "feat: projeto pronto para deploy"
   git push origin main
   ```

2. **Conectar na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Import seu repositório do GitHub
   - Configure as variáveis de ambiente

3. **Variáveis de Ambiente**
   Em Project Settings > Environment Variables, adicione:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/faqdb
   GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   DRIVE_FOLDER_ID=1abc...xyz
   GROQ_API_KEY=gsk_...
   ```

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build (2-3 minutos)
   - Acesse o link gerado

5. **Configurar MongoDB Atlas**
   - Adicione o IP da Vercel na whitelist (ou use 0.0.0.0/0)
   - Certifique-se de que o usuário tem permissões de leitura/escrita

6. **Testar**
   - Acesse sua aplicação
   - Clique em "Sincronizar" para processar PDFs do Drive
   - Verifique se os resumos aparecem

### Dicas para Produção
- Use MongoDB Atlas (gratuito até 512MB)
- Configure domínio customizado na Vercel (opcional)
- Monitore uso de API do Groq (limits gratuitos)
- Verifique logs na Vercel em caso de erros

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## 📄 Licença

Este projeto é privado e destinado para uso acadêmico.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o estudo acadêmico.

---

**Nota**: Este é um projeto em desenvolvimento ativo. Funcionalidades podem ser adicionadas ou modificadas.
