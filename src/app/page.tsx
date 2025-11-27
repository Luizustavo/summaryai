'use client';

import { useEffect, useState } from 'react';

interface FAQEntry {
  _id: string;
  title: string;
  summary: string;
  meta: {
    discipline: string;
    lectureNumber?: number;
    theme?: string;
  };
  source?: {
    fileName?: string;
  };
  createdAt: string;
}

interface Category {
  color: string;
  keywords: string[];
}

const CATEGORIES: Record<string, Category> = {
  'Computação em Nuvem II': {
    color: 'bg-slate-900',
    keywords: ['nuvem', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'container', 'serverless', 'microserviços', 'devops', 'infraestrutura']
  },
  'Processamento de Linguagem Natural': {
    color: 'bg-violet-900',
    keywords: ['pln', 'nlp', 'linguagem', 'natural', 'texto', 'processamento', 'tokenização', 'bert', 'gpt', 'transformer', 'word2vec', 'embedding', 'sentimento', 'chatbot']
  },
  'Qualidade e Testes de Software': {
    color: 'bg-emerald-900',
    keywords: ['teste', 'testes', 'qualidade', 'qa', 'unitário', 'integração', 'cobertura', 'jest', 'junit', 'selenium', 'automation', 'bug', 'defeito', 'validação', 'verificação']
  },
  'Mineração de Dados': {
    color: 'bg-amber-900',
    keywords: ['mineração', 'dados', 'data mining', 'machine learning', 'ml', 'classificação', 'regressão', 'clustering', 'aprendizado', 'modelo', 'algoritmo', 'python', 'pandas', 'scikit', 'análise']
  },
  'Ética Profissional e Patente': {
    color: 'bg-indigo-900',
    keywords: ['ética', 'profissional', 'patente', 'propriedade', 'intelectual', 'direito', 'autoral', 'legislação', 'lgpd', 'privacidade', 'conduta', 'responsabilidade']
  },
  'Outros': {
    color: 'bg-gray-900',
    keywords: []
  }
};

function categorizeEntry(entry: FAQEntry): string {
  const title = entry.title?.toLowerCase() || '';
  const discipline = entry.meta?.discipline?.toLowerCase() || '';
  const summary = entry.summary?.toLowerCase() || '';
  const searchText = `${title} ${discipline} ${summary}`;
  
  // Buscar a melhor categoria baseada nas palavras-chave
  let bestMatch = 'Outros';
  let maxMatches = 0;
  
  for (const [category, config] of Object.entries(CATEGORIES)) {
    if (category === 'Outros') continue;
    
    const matches = config.keywords.filter(keyword => 
      searchText.includes(keyword)
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = category;
    }
  }
  
  return bestMatch;
}

// Função para formatar o summary com títulos em negrito
function formatSummary(text: string): string {
  // Padrões de títulos comuns no summary
  const titlePatterns = [
    'Contexto:',
    'Conceitos-Chave:',
    'Exemplos Práticos:',
    'Aplicação:',
    'Erro Comum:',
    'Resumo Final:',
    'Definição:',
    'Objetivos:',
    'Metodologia:',
    'Resultados:',
    'Conclusão:',
    'Referências:',
    'Observações:',
    'Exemplo 1:',
    'Exemplo 2:',
    'Exemplo 3:',
    'Nota:'
  ];

  let formattedText = text;
  
  // Substituir cada padrão por versão em negrito
  titlePatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'g');
    formattedText = formattedText.replace(regex, `**${pattern}**`);
  });

  return formattedText;
}


export default function FAQPage() {
  const [entries, setEntries] = useState<FAQEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedEntry, setSelectedEntry] = useState<FAQEntry | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');
  const [syncing, setSyncing] = useState(false);

  const loadEntries = async () => {
    try {
      const res = await fetch('/api/faq');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error('Erro ao carregar resumos:', err);
    }
  };

  useEffect(() => {
    loadEntries().finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      const res = await fetch('/api/cron/sync-drive', { method: 'GET' });
      const data = await res.json();
      
      if (res.ok) {
        await loadEntries();
        alert(`Sincronização concluída! ${data.message || 'Resumos atualizados com sucesso.'}`);
      } else {
        alert(`Erro na sincronização: ${data.error || 'Tente novamente.'}`);
      }
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
      alert('Erro ao sincronizar. Verifique o console para mais detalhes.');
    } finally {
      setSyncing(false);
    }
  };

  const categorizedEntries = entries.reduce((acc, entry) => {
    const category = categorizeEntry(entry);
    if (!acc[category]) acc[category] = [];
    acc[category].push(entry);
    return acc;
  }, {} as Record<string, FAQEntry[]>);

  let filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.meta?.discipline?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || 
      categorizeEntry(entry) === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  filteredEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  const categories = Object.keys(CATEGORIES);
  const categoryCount = (cat: string) => 
    cat === 'Todos' ? entries.length : categorizedEntries[cat]?.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Carregando</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
                Biblioteca de Conhecimento
              </h1>
              <p className="text-sm text-slate-600">
                {entries.length} resumos disponíveis
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Sincronizar com Google Drive"
              >
                <svg 
                  className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                <span className="sm:hidden">{syncing ? 'Sync...' : 'Sync'}</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="recent">Mais recentes</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Busca */}
          <div className="relative mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Buscar resumos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="relative -mx-4 md:mx-0">
            <div className="flex md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-x-visible px-4 md:px-0 pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('Todos')}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === 'Todos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Todos ({entries.length})
              </button>

              {categories.map(category => {
                const count = categoryCount(category);
                if (count === 0) return null;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all shrink-0 ${
                      selectedCategory === category
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-slate-500 text-base sm:text-lg">
              {entries.length === 0 ? 'Nenhum resumo disponível' : 'Nenhum resultado encontrado'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEntries.map((entry) => {
              const category = categorizeEntry(entry);
              const config = CATEGORIES[category];

              return (
                <article
                  key={entry._id}
                  onClick={() => setSelectedEntry(entry)}
                  className="group bg-white border border-slate-200 hover:border-slate-900 transition-all cursor-pointer flex flex-col"
                >
                  {/* Imagem/Header do card */}
                  <div className={`${config.color} h-48 p-6 flex flex-col justify-between`}>
                    <div>
                      <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                        {category}
                      </div>
                      {entry.meta.lectureNumber && (
                        <div className="text-xs text-white/60 font-medium">
                          Aula {entry.meta.lectureNumber}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-white/60 font-medium">
                      {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-6 flex flex-col grow">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:underline">
                      {entry.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3 grow leading-relaxed">
                      {entry.summary}
                    </p>

                    <div className="text-xs text-slate-500 font-medium border-t border-slate-100 pt-4">
                      {entry.meta.discipline}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50"
          onClick={() => setSelectedEntry(null)}
        >
          <div 
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-lg sm:rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-slate-200 p-4 sm:p-8">
              <button
                onClick={() => setSelectedEntry(null)}
                className="float-right text-slate-400 hover:text-slate-900 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sm:mb-3">
                {categorizeEntry(selectedEntry)}
              </div>

              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 pr-8 sm:pr-12">
                {selectedEntry.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                <span className="font-medium">{selectedEntry.meta.discipline}</span>
                {selectedEntry.meta.lectureNumber && (
                  <span>Aula {selectedEntry.meta.lectureNumber}</span>
                )}
                {selectedEntry.meta.theme && (
                  <span className="text-slate-500">{selectedEntry.meta.theme}</span>
                )}
                <span>{new Date(selectedEntry.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>

              {selectedEntry.source?.fileName && (
                <div className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-2 rounded border border-slate-200 inline-block break-all">
                  Arquivo: {selectedEntry.source.fileName}
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="overflow-y-auto p-4 sm:p-8 bg-slate-50">
              <div className="prose prose-slate prose-sm max-w-none bg-white rounded-lg px-4 pb-4 sm:px-8 sm:pb-8 shadow-sm">
                <div 
                  className="text-slate-700 leading-loose text-justify text-sm sm:text-base"
                  style={{ whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ 
                    __html: formatSummary(selectedEntry.summary)
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 sm:p-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-6 py-2.5 sm:py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors rounded-md"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
