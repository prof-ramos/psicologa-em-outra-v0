# Gerador de Mapa Astral com Chatbot IA

Um aplicativo Next.js 14 completo para gerar mapas astrais e conversar sobre astrologia com IA, usando apenas serviços gratuitos.

## 🌟 Características

### 🔮 **Gerador de Mapa Astral**
- **100% Gratuito**: Usa apenas APIs e serviços gratuitos
- **Geocodificação**: Nominatim (OpenStreetMap) para busca de localização
- **Cálculo de Timezone**: Biblioteca local para determinar fuso horário
- **API Astrológica**: Integração com Astrologer API via RapidAPI (chave gratuita)
- **Visualização**: Roda zodiacal SVG interativa

### 🤖 **Chatbot Astrológico IA**
- **Powered by Gemini**: Usa a API Gemini do Google para conversas inteligentes
- **Interpretação Personalizada**: Analisa especificamente seu mapa astral
- **Conversas Naturais**: Interface de chat amigável e intuitiva
- **Insights Práticos**: Oferece conselhos baseados em suas características astrológicas
- **Contexto Completo**: Considera planetas, casas, aspectos e elementos

## 🚀 Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod (validação)
- Luxon (datas/timezone)
- Google Generative AI (Gemini)

## 📋 Pré-requisitos

1. **Chave RapidAPI gratuita**:
   - Acesse [RapidAPI Astrologer](https://rapidapi.com/gbattaglia/api/astrologer)
   - Crie uma conta gratuita
   - Obtenha sua chave da API

2. **Chave Gemini API gratuita**:
   - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crie uma conta Google
   - Gere sua chave gratuita da API

## 🛠️ Instalação

1. Clone o repositório:
\`\`\`bash
git clone <url-do-repositorio>
cd astral-chart-generator
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Edite `.env.local` com suas informações:
\`\`\`env
RAPIDAPI_KEY=sua_chave_gratuita_aqui
NOMINATIM_EMAIL=seu-email@dominio.com
GEMINI_API_KEY=sua_chave_gemini_aqui
\`\`\`

5. Execute o projeto:
\`\`\`bash
npm run dev
\`\`\`

## 🤖 Funcionalidades do Chatbot

### 💬 **Conversas Inteligentes**
- Interpreta posições planetárias específicas
- Explica significados dos signos e casas
- Analisa aspectos planetários
- Oferece insights sobre personalidade

### 🎯 **Tópicos Suportados**
- Características do signo solar, lunar e ascendente
- Influência dos planetas nas casas
- Interpretação de aspectos (conjunção, trígono, etc.)
- Análise de elementos (fogo, terra, ar, água)
- Modalidades (cardinal, fixo, mutável)
- Conselhos práticos baseados no mapa

### 🌟 **Exemplos de Perguntas**
- "O que meu Sol em Leão significa?"
- "Como minha Lua em Câncer afeta minhas emoções?"
- "Quais são meus aspectos mais importantes?"
- "Como posso usar meu mapa para crescimento pessoal?"
- "O que significa ter Vênus na Casa 7?"

## 📱 Como Usar

### 1. **Gere seu Mapa Astral**
- Preencha nome, data, hora e local de nascimento
- Use o autocomplete para encontrar sua cidade
- Clique em "Gerar Mapa Astral"

### 2. **Converse com o Chatbot**
- Clique no ícone de chat (aparece após gerar o mapa)
- Faça perguntas sobre seu mapa astral
- Receba interpretações personalizadas
- Use as perguntas sugeridas como ponto de partida

### 3. **Explore seus Dados**
- Visualize a roda zodiacal interativa
- Consulte a lista de planetas e aspectos
- Converse com a IA para entender melhor

## 🌍 Serviços Utilizados

### Nominatim (OpenStreetMap)
- **Uso**: Geocodificação gratuita
- **Rate Limit**: 1 requisição por segundo
- **Política**: Uso responsável com User-Agent e email

### RapidAPI Astrologer
- **Uso**: Cálculos astrológicos
- **Plano**: Gratuito (com limites)
- **Autenticação**: Chave da API

### Google Gemini API
- **Uso**: Chatbot astrológico inteligente
- **Plano**: Gratuito (com limites generosos)
- **Modelo**: gemini-pro

### Luxon
- **Uso**: Cálculos de timezone e data/hora
- **Tipo**: Biblioteca local (sem API externa)

## ⚠️ Limitações e Boas Práticas

### Nominatim (OpenStreetMap)
- Máximo 1 requisição por segundo
- Use sempre User-Agent identificando sua aplicação
- Inclua email de contato no header
- Respeite os termos de uso

### RapidAPI
- Plano gratuito tem limites mensais
- Monitore seu uso no dashboard
- Considere upgrade se necessário

### Gemini API
- Limite gratuito: 60 requisições por minuto
- Monitore uso no Google AI Studio
- Respostas podem variar (natureza da IA)

## 🔧 Desenvolvimento

### Estrutura do Projeto
\`\`\`
app/
├── page.tsx                 # Página principal
├── api/
│   ├── chart/route.ts       # API endpoint para mapas
│   └── astrology-chat/route.ts # API endpoint para chatbot
├── components/
│   ├── LocationCombobox.tsx # Busca de localização
│   ├── ZodiacWheel.tsx      # Roda zodiacal
│   ├── PlanetList.tsx       # Lista de planetas
│   └── AstrologicalChatbot.tsx # Chatbot IA
├── types/
│   └── astrology.ts         # Tipos TypeScript
└── utils/
    ├── zodiac.ts            # Utilitários zodiacais
    ├── aspects.ts           # Cálculos de aspectos
    └── timezone.ts          # Cálculos de timezone
\`\`\`

### Personalizando o Chatbot
1. **Modificar prompts**: Edite `/api/astrology-chat/route.ts`
2. **Adicionar contexto**: Expanda `generateAstrologicalContext()`
3. **Novos tópicos**: Atualize as instruções do prompt
4. **Interface**: Customize `AstrologicalChatbot.tsx`

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- Netlify
- Railway
- Render

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Consulte as issues existentes
3. Abra uma nova issue se necessário

---

**Nota**: Este projeto usa apenas serviços gratuitos. Para uso comercial intensivo, considere APIs pagas para melhor performance e limites maiores.
