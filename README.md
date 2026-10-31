# TrustLink (Verilar) — O LinkedIn da Confiança

Plataforma web que conecta **famílias** a **profissionais de cuidado e serviços domésticos** (diaristas, babás e cuidadoras) com foco em confiança: perfis verificados, avaliações duplas (pública e sigilosa), contratos digitais e um radar de profissionais disponíveis por perto.

O projeto é um app único: o **Express** serve a API REST e, no mesmo processo, o **Vite** entrega o frontend em React. O banco é um arquivo **SQLite** local, criado e populado automaticamente na primeira execução.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Contas de demonstração](#contas-de-demonstração)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Banco de dados](#banco-de-dados)
- [API](#api)
- [Solução de problemas](#solução-de-problemas)

---

## Funcionalidades

O app tem dois perfis de usuário, **profissional** (`freelancer`) e **contratante** (`employer`), e mostra telas diferentes para cada um.

**Para o contratante (família)**
- **Catálogo de profissionais:** busca e filtro de cuidadoras, babás e diaristas.
- **Dossiê do candidato:** selos de verificação, avaliações e histórico antes de contratar.
- **Radar de urgência:** profissionais verificados e disponíveis perto de você, com distância calculada por coordenadas (fórmula de Haversine) e mapa opcional.
- **Chat com Pix:** conversa com o profissional e fluxo de pagamento dentro do chat.
- **Contratos digitais:** criação, assinatura e conclusão.
- **Vagas:** criação de anúncios e acompanhamento dos candidatos por etapa.
- **Avaliação pública e sigilosa:** nota e comentário públicos, mais uma avaliação confidencial com critérios como honestidade, pontualidade, estabilidade emocional, discrição e reação em crise.

**Para o profissional**
- **Perfil e selos de verificação:** identidade, antecedentes criminais, certificado de formação, biometria facial, CNH e conselho de enfermagem, cada um com validade e hash do documento.
- **Disponibilidade:** online, offline ou modo urgência, com raio de atendimento.
- **Habilidades validadas por contratos reais.**
- **Planos de destaque:** Gratuito, Destaque (R$ 9,90/mês) e Destaque Pro (R$ 19,90/mês), com opção de cobrança anual.
- **Candidatura a vagas.**

**Geral**
- **Feed de confiança:** publicações e curtidas.
- **Login com sessões:** access token JWT de 2 horas, refresh token em cookie `httpOnly` por 30 dias e tela para ver e encerrar sessões ativas.
- **Login de demonstração** com um clique para cada perfil e **reset** dos dados de demo.
- **Tema claro e escuro.**

> Os dados de exemplo (profissionais, contratos, avaliações) são fictícios e existem para demonstração.

---

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4, GSAP, Lucide React |
| Mapa (opcional) | `@vis.gl/react-google-maps` (Google Maps JavaScript API) |
| Backend | Node.js, Express 5, Zod (validação) |
| Autenticação | JWT (`jsonwebtoken`), `bcryptjs`, cookies com `cookie-parser` |
| Banco de dados | SQLite via **sql.js** (WebAssembly) com **Drizzle ORM** |
| Linguagem | TypeScript |

O SQLite roda em WebAssembly, então **não é preciso compilar nada** (sem `node-gyp`, sem Visual Studio, sem Python). Isso evita os erros de instalação comuns no Windows.

---

## Pré-requisitos

- **Node.js 22.12 ou mais novo** (recomendado: **Node 24 LTS**). Versões antigas, como a 22.9, não funcionam: o Vite 8 exige `^20.19.0 || >=22.12.0`.
- **npm** (já vem com o Node).

Confira a versão instalada:

```bash
node -v
```

---

## Como rodar

1. **Extraia o projeto** em uma pasta simples, de preferência fora do Desktop (por exemplo `C:\projetos\trustlink`). Pastas sincronizadas pelo OneDrive podem travar arquivos do `node_modules`.

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Crie o arquivo de ambiente** (opcional, o app tem valores padrão):

   ```bash
   # Linux / macOS
   cp .env.example .env

   # Windows (cmd)
   copy .env.example .env
   ```

4. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

5. Quando aparecer a mensagem abaixo, abra **http://localhost:3000** no navegador:

   ```
   [Verilar] 4/4 Pronto! Abra no navegador: http://localhost:3000
   ```

Na primeira execução, o banco `trustlink.db` é criado e populado sozinho.

### Rodar em modo produção

```bash
npm run start:local
```

Esse comando gera o build (`dist/`) e sobe o servidor servindo os arquivos compilados.

### Rodar sem o `tsx`

Se o `npm run dev` não funcionar no seu ambiente, use o Node puro:

```bash
npm run dev:node
```

Esse modo exige Node 22.18 ou mais novo (ou o script com as flags `--experimental-strip-types`, já incluídas no `package.json`).

---

## Contas de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Profissional (Cida Oliveira) | `cida@verilar.com.br` | `verilar123` |
| Contratante (Marina Mendes) | `marina@verilar.com.br` | `verilar123` |

A tela de login também tem botões de **login de demonstração** para entrar direto com cada perfil.

---

## Variáveis de ambiente

Definidas no arquivo `.env` (modelo em `.env.example`):

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do servidor (API + frontend). Se não for definida e a porta estiver ocupada, o servidor tenta até 5 portas seguintes. |
| `SQLITE_DB_PATH` | `./trustlink.db` | Caminho do arquivo do banco. Use `:memory:` para um banco temporário em memória. |
| `JWT_SECRET` | valor de desenvolvimento | Chave de assinatura dos tokens JWT. **Troque em produção.** |
| `VITE_GOOGLE_MAPS_API_KEY` | vazio | Chave da Google Maps JavaScript API. Sem ela, o resto do app funciona, só o mapa interativo do Radar fica indisponível. |
| `DISABLE_HMR` | — | Com o valor `true`, desativa o hot reload do Vite. |

> O arquivo `.env` está no `.gitignore`. Nunca publique chaves reais no repositório.

---

## Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (API + Vite) usando `tsx`. |
| `npm run dev:node` | O mesmo, usando só o Node com `--experimental-strip-types`. |
| `npm run build` | Gera o build do frontend em `dist/`. |
| `npm run start:local` | Faz o build e sobe o servidor em modo produção. |
| `npm run start` | Sobe o servidor sem rodar o build antes. |
| `npm run preview` | Pré-visualiza o build do Vite. |
| `npm run db:init` | Cria o arquivo do banco e popula os dados de exemplo, sem subir o servidor. |
| `npm run db:studio` | Abre o Drizzle Studio para explorar o banco. |
| `npm run typecheck` / `npm run lint` | Verifica os tipos com `tsc --noEmit`. |
| `npm run clean` | Apaga a pasta `dist/`. |

---

## Estrutura do projeto

```
.
├── server.ts                 # Entrada: banco, API Express e Vite/estáticos
├── index.html
├── vite.config.ts
├── drizzle.config.ts
├── .env.example
└── src/
    ├── main.tsx              # Entrada do React
    ├── App.tsx               # Rotas e estado global do app
    ├── index.css             # Estilos (Tailwind)
    ├── components/
    │   ├── auth/             # Login e cadastro
    │   ├── catalog/          # Catálogo de profissionais
    │   ├── chat/             # Chat e Pix
    │   ├── contracts/        # Contratos digitais
    │   ├── employer/         # Área do contratante, dossiê e anúncios
    │   ├── feed/             # Feed de confiança
    │   ├── freelancer/       # Perfil, selos e avaliação sigilosa
    │   ├── home/             # Página inicial
    │   ├── jobs/             # Vagas
    │   ├── layout/           # Barra de navegação
    │   ├── plans/            # Planos de destaque
    │   ├── radar/            # Radar de urgência (mapa)
    │   └── common/           # Modal, toasts, tema e componentes comuns
    ├── db/
    │   ├── schema.ts         # Tabelas (Drizzle)
    │   ├── index.ts          # Conexão SQLite (sql.js) e criação das tabelas
    │   ├── seed.ts           # Popula dados iniciais
    │   ├── seedData.ts       # Dados de exemplo
    │   └── initCli.ts        # Script do `npm run db:init`
    ├── server/
    │   ├── routes.ts         # Rotas da API (/api/v1)
    │   ├── auth.ts           # JWT, sessões e middleware de autenticação
    │   └── geo.ts            # Cálculo de distância (Haversine)
    ├── services/             # Cliente da API usado pelo frontend
    ├── types/                # Tipos TypeScript compartilhados
    └── lib/                  # Utilitários
```

---

## Banco de dados

SQLite gravado em arquivo (`trustlink.db` por padrão). Se a pasta do projeto não permitir escrita, o app grava uma cópia na pasta temporária do sistema.

Tabelas principais (definidas em `src/db/schema.ts`):

| Tabela | Conteúdo |
| --- | --- |
| `users` | Contas de usuário e papel (profissional ou contratante) |
| `sessions` | Sessões e refresh tokens |
| `profiles` | Perfis profissionais, selos, tarifas, localização e plano |
| `chat_messages` | Mensagens do chat e cobranças Pix |
| `contracts` | Contratos entre contratante e profissional |
| `public_reviews` | Avaliações públicas |
| `secret_evaluations` | Avaliações confidenciais |
| `job_announcements` | Anúncios de vagas |
| `job_applicants` | Candidaturas e etapa de cada candidato |
| `feed_posts` | Publicações do feed |

Para **recomeçar do zero**, pare o servidor, apague o arquivo `trustlink.db` e rode `npm run dev` de novo. Ele será recriado com os dados de exemplo. Dentro do app, o endpoint `POST /api/v1/demo/reset` faz o mesmo reset dos dados de demonstração.

---

## API

Base: `/api/v1`. As rotas, exceto as de `auth` marcadas como públicas, exigem o header `Authorization: Bearer <accessToken>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Estado do servidor (pública) |
| POST | `/auth/login` | Login com e-mail e senha (pública) |
| POST | `/auth/register` | Cadastro (pública) |
| POST | `/auth/demo-login` | Login de demonstração por perfil (pública) |
| POST | `/auth/refresh` | Renova o access token pelo cookie de refresh |
| POST | `/auth/logout` | Encerra a sessão |
| GET | `/auth/me` | Dados do usuário autenticado |
| GET | `/auth/sessions` | Lista as sessões ativas |
| DELETE | `/auth/sessions/:id` | Encerra uma sessão |
| GET | `/bootstrap` | Carrega os dados iniciais do app |
| PATCH | `/profiles/:id/availability` | Altera a disponibilidade |
| POST | `/profiles/:id/verify` | Envia verificação de selo |
| PATCH | `/profiles/:id/plan` | Altera o plano de destaque |
| GET | `/radar/nearby` | Profissionais próximos (`lat`, `lng`, `radiusKm`, `category`, `urgencyOnly`) |
| POST | `/chats/messages` | Envia mensagem |
| PATCH | `/chats/messages/:id/pay` | Paga uma cobrança do chat |
| POST | `/contracts` | Cria contrato |
| PATCH | `/contracts/:id/sign` | Assina contrato |
| PATCH | `/contracts/:id/complete` | Conclui contrato |
| POST | `/reviews/public` | Cria avaliação pública |
| POST | `/reviews/secret` | Cria avaliação sigilosa |
| POST | `/jobs` | Cria anúncio de vaga |
| POST | `/jobs/:id/apply` | Candidata-se a uma vaga |
| PATCH | `/jobs/:announcementId/applicants/:applicantId/stage` | Muda a etapa de um candidato |
| POST | `/feed` | Cria publicação |
| POST | `/feed/:id/like` | Curte uma publicação |
| POST | `/demo/reset` | Restaura os dados de demonstração |

Rotas desconhecidas em `/api/*` retornam JSON `404`.

---

## Solução de problemas

**`ERR_UNKNOWN_FILE_EXTENSION: Unknown file extension ".ts"`**
Seu Node é antigo demais. Atualize para o Node 24 LTS ou para o 22.18 ou mais novo.

**`npm run dev` termina sem imprimir nada, ou o código de saída é `-1073741819`**
Normalmente é versão do Node abaixo da 22.12. Atualize o Node, apague a pasta `node_modules` e rode `npm install` de novo.

**`EBADENGINE Unsupported engine` no `npm install`**
É o mesmo problema: o Node está abaixo da versão exigida pelo Vite 8.

**`EPERM` ao apagar `node_modules` no Windows**
Há processo do Node ainda aberto. Feche o VS Code e os terminais, rode `taskkill /F /IM node.exe` e tente de novo. Se persistir, extraia o projeto em uma pasta nova, fora do Desktop.

**Porta 3000 em uso**
Defina outra porta no `.env` (`PORT=3001`) ou encerre o processo que está usando a 3000.

**Mapa do Radar não aparece**
Defina `VITE_GOOGLE_MAPS_API_KEY` no `.env` e reinicie o servidor.

**Quero resetar os dados**
Apague `trustlink.db` com o servidor parado e inicie de novo.
