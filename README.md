# 📚 Agente FAQ IA

Sistema inteligente de geração automática de resumos acadêmicos a partir de arquivos PDF armazenados no Google Drive, utilizando IA para criar conteúdo estruturado e organizado.

## 🎯 Visão Geral

O **Agente FAQ IA** é uma aplicação Next.js que automatiza o processo de:
1. **Extração** de arquivos PDF do Google Drive
2. **Processamento** do conteúdo dos PDFs
3. **Geração** de resumos inteligentes usando IA (Groq/LLaMA)
4. **Armazenamento** estruturado no MongoDB
5. **Visualização** em interface web moderna e responsiva

## ✨ Funcionalidades

### 🤖 Processamento Inteligente
- Extração automática de texto de arquivos PDF
- Geração de resumos acadêmicos usando IA (LLaMA 3.1)
- Identificação automática de disciplina, número da aula e tema
- Deduplicação inteligente (não processa o mesmo arquivo duas vezes)

### 🎨 Interface Moderna
- Design responsivo com Tailwind CSS
- Categorização automática por tipo de conteúdo:
  - Lógica de Programação
  - Banco de Dados
  - Web Development
  - Estrutura de Dados
  - Outros
- Sistema de busca em tempo real
- Filtros por categoria
- Modal para visualização completa dos resumos
- Cards com hover effects e badges coloridos

### 🔄 Sincronização Automática
- Integração com Google Drive API
- Sincronização via CRON job
- Processamento em background

## 🛠️ Tecnologias

### Core
- **Next.js 16** - Framework React com App Router
- **TypeScript** - Type safety
- **React 19** - UI Library

### Banco de Dados
- **MongoDB 7** - Armazenamento de resumos
- Database: `faqdb`
- Collection: `faqEntries`

### IA & Processamento
- **Groq API** - Inferência de IA (LLaMA 3.1 8B Instant)
- **pdf2json** - Extração de texto de PDFs
- **Zod** - Validação de schemas

### Cloud & APIs
- **Google Drive API** - Acesso a arquivos
- **googleapis** - Cliente Node.js para Google APIs

### Estilo
- **Tailwind CSS 4** - Utility-first CSS
- **PostCSS** - Processamento CSS

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
cd agente-faq-ia
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
agente-faq-ia/
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

### Sincronização Manual

Um **botão "Sincronizar"** está disponível no header da aplicação:
- Ícone de refresh que anima durante sincronização
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
  title: string,                    // Título gerado pela IA
  summary: string,                  // Resumo gerado pela IA
  source: {
    driveFileId: string,           // ID único do Google Drive
    fileName: string,              // Nome original do arquivo
    mimeType: string              // Tipo MIME
  },
  meta: {
    discipline: string,            // Disciplina identificada
    lectureNumber: number,         // Número da aula
    theme: string                  // Tema central
  },
  createdAt: Date                   // Data de criação
}
```

## 🎨 Interface do Usuário

### Página Principal
- Grid responsivo de cards (1-3 colunas)
- Badge colorido por categoria
- Busca em tempo real
- Filtros clicáveis
- Preview truncado do resumo

### Modal de Detalhes
- Header com gradiente azul
- Informações completas (disciplina, aula, data)
- Texto completo do resumo
- Scrollável para textos longos
- Fechamento por overlay ou botão

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
Lista todos os resumos cadastrados.

**Response:**
```json
[
  {
    "_id": "...",
    "title": "Aula 01 - Introdução",
    "summary": "Resumo detalhado...",
    "meta": {
      "discipline": "Banco de Dados",
      "lectureNumber": 1,
      "theme": "Introdução a BD"
    },
    "createdAt": "2025-11-26T..."
  }
]
```

### `GET /api/cron/sync-drive`
Sincroniza arquivos do Google Drive e processa novos PDFs.

**Response:**
```json
{
  "message": "Sync completed successfully"
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
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env.local`
- Para Atlas, verifique whitelist de IPs

### Erro ao acessar Google Drive
- Confirme as credenciais da Service Account
- Verifique se a pasta foi compartilhada com o email correto
- Valide o `DRIVE_FOLDER_ID`

### Erro ao extrair texto do PDF
- Certifique-se de que o arquivo é um PDF válido
- PDFs escaneados (imagens) não funcionam (necessitam OCR)
- Verifique logs no console

### Erro na geração de resumo (Groq)
- Valide a `GROQ_API_KEY`
- Verifique limites de rate da API
- Confirme que o texto extraído não está vazio

## 📝 Roadmap

- [ ] Suporte a OCR para PDFs escaneados
- [ ] Upload direto de arquivos
- [ ] Exportação de resumos (PDF, Markdown)
- [ ] Sistema de tags customizáveis
- [ ] Modo escuro
- [ ] Internacionalização (i18n)
- [ ] Testes automatizados
- [ ] Dashboard de analytics

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## 📄 Licença

Este projeto é privado e destinado para uso acadêmico.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o estudo acadêmico.

---

**Nota**: Este é um projeto em desenvolvimento ativo. Funcionalidades podem ser adicionadas ou modificadas.
