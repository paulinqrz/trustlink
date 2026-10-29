# TrustLink — O LinkedIn da Confiança (Arquitetura e Plataforma)

Estruturação técnica completa e desenvolvimento de uma plataforma de alta confiabilidade para contratação de profissionais e cuidadores, integrando reputação verificada, avaliações anônimas sigilosas vinculadas a contratos, busca geoespacial por PostGIS e gestão de sessão ininterrupta.

### User Review & Critical Decisions

> [!IMPORTANT]
> As escolhas prioritárias confirmadas pelo usuário foram integradas:
> - **Identidade Visual**: Minimalista neutro, com estética focada em privacidade, criptografia e alta segurança (tons de ardósia, grafite escuro, esmeralda de validação e ausência de ruídos visuais).
> - **Navegação Interativa**: Foco primordial na visualização do Freelancer (gestão de portfólio, status de disponibilidade imediata/urgência, selos validados e acesso controlado à Rede Sigilosa), permitindo também alternar com o Dashboard do Empregador e com o Console de Engenharia & Tech Lead.
> - **Contratos Automáticos**: Visualizador interativo e modal formal de contrato de prestação de serviços com cláusulas de sigilo, chaves de integridade, assinaturas digitais simuladas e emissão de documento.

- **Validação de Avaliação Dupla**: Restrição estrita no nível de banco e regras de negócio: `reviews` e `secret_evaluations` exigem `contract_id` com status obrigatório `'completed'` e chave estrangeira validada.
- **Armazenamento de Credenciais e Documentos**: URLs seguras assinadas (S3 Presigned URLs) para PDFs de antecedentes, CNH e registros biométricos, com dados sensíveis nunca expostos publicamente.

---

### 1. Overview & Core Concept

- **O que faz**: Conecta famílias e empregadores a profissionais de alto valor e intimidade (cuidadores de idosos, babás/cuidadoras infantis, domésticos, pet sitters e enfermeiros particulares) com garantia máxima de integridade e histórico verificado.
- **Público-alvo**: 
  - **Freelancers/Profissionais de Confiança**: Que buscam valorização de carreira com histórico inalterável, endossos de ex-empregadores e contratos formais seguros.
  - **Empregadores/Famílias**: Que exigem verificação rigorosa de antecedentes criminais, biometria e acesso à Rede Sigilosa (feedback comportamental honesto sem risco de retaliação).
- **Proposta de Valor**: Eliminação do risco em serviços de alta vulnerabilidade por meio de dupla camada avaliativa (pública vs. sigilosa) e socorro imediato via Radar de Urgência (PostGIS num raio de 10km).

---

### 2. User Experience & Visual Design

- **Diretriz Estética**: Minimalismo neutro e seguro. Paleta sóbria em ardósia fria (`slate-900`/`slate-50`), cinza estrutural refinado (`zinc-100`/`zinc-800`), toques de verde esmeralda confiável (`emerald-600`) para selos autenticados e âmbar discreto para o Radar de Urgência.
- **Tipografia**: `Plus Jakarta Sans` para títulos e hierarquia de navegação; `Public Sans` para leitura técnica e termos contratuais; `JetBrains Mono` com números tabulares (`tabular-nums`) para coordenadas, distâncias, IDs de contrato e hashes de sessão.
- **Jornadas do Usuário na Aplicação**:
  1. **Perfil do Freelancer & Verificações**: Visualização de portfólio com selos de Antecedentes Criminais, CNH e Check Facial; seletor de disponibilidade (Online, Offline e Urgência); e histórico de contratos.
  2. **Rede Sigilosa (Avaliação Comportamental)**: Espaço confidencial criptografado acessível apenas a empregadores cadastrados e com contrato finalizado com o profissional. Exibe métricas de pontualidade, honestidade, estabilidade emocional e discrição.
  3. **Radar de Urgência (PostGIS 10km)**: Mapa/radar interativo com simulação de busca radial, calculando distância euclidiana/geodésica real com ordenação por proximidade para substituição imediata de plantão.
  4. **Fluxo de Contratação & Gerador de Contrato**: Chat criptografado com envio de propostas e gerador de contrato automático formal com termos de sigilo e assinatura digital.
  5. **Console Tech Lead & Engenharia**: Aba dedicada contendo a arquitetura de pastas do Fastify, passo a passo do middleware de autenticação (JWT + Refresh Token + Redis) e a query SQL PostGIS interativa com ajuste de parâmetros em tempo real.

---

### 3. Key Product Decisions & Trade-Offs

- **Fastify vs Express**:
  - *Abordagem*: Fastify adotado no design de backend por sua performance superior de roteamento (~30k+ req/s), validação de esquema nativa via JSON Schema (Ajv) e arquitetura de plugins modular (`fastify-plugin`, `@fastify/jwt`, `@fastify/cookie`).
- **Autenticação Dupla com Rotação de Tokens**:
  - *Abordagem*: Access Token JWT em memória (validade curta: 15 minutos) e Refresh Token em Cookie HttpOnly/SameSite=Strict (validade longa: 30 dias).
  - *Por que*: O cookie HttpOnly impede acesso via JavaScript malicioso (XSS), enquanto o Redis mantém o mapeamento `session:{userId}:{familyId}` permitindo revogação instantânea e logout remoto de dispositivos comprometidos.
- **PostGIS `geography(Point, 4326)` vs Cálculo Matemático em Aplicação**:
  - *Abordagem*: Uso do índice espacial GiST no PostgreSQL e da função `ST_DWithin` com coordenadas em WGS 84.
  - *Por que*: O cálculo nativo no banco aproveita o índice de árvore espacial (R-Tree/GiST), executando filtros em sub-milissegundos mesmo com milhões de pontos cadastrados.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### A. Arquitetura do Sistema e Fluxo de Dados

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (SPA / Mobile)                     │
│  React 19 + Tailwind v4 + Lucide + Interceptor de Sessão Silenciosa    │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ HTTPS / REST (JSON)             │ HttpOnly Cookie
                   ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTIFY BACKEND CLUSTER                         │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │  Auth & Session Hook  │──▶│ Plugins: Fastify JWT, Cookie, Cors   │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │   Domain Controllers  │   │ Validation Schemas (Ajv/TypeBox)     │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
└────────────┬─────────────────────────────┬─────────────────────────────┘
             │                             │
             ▼                             ▼
┌───────────────────────────┐ ┌──────────────────────────────────────────┐
│       REDIS CLUSTER       │ │        POSTGRESQL 16 + POSTGIS           │
│ - Sessões Ativas & Tokens │ │ - Users, Profiles, Jobs, Contracts       │
│ - Status Online / Urgência│ │ - Reviews & Secret Evaluations           │
│ - Fila Pub/Sub de Urgência│ │ - GiST Spatial Index (ST_DWithin 10km)   │
└───────────────────────────┘ └──────────────────────────────────────────┘
```

#### B. Arquitetura de Pastas e Rotas no Fastify

```
src/
├── app.ts                  # Instância e registro de plugins do Fastify
├── server.ts               # Inicialização e graceful shutdown
├── config/
│   ├── env.ts              # Validação de variáveis de ambiente com Ajv
│   └── database.ts         # Pool do PostgreSQL (pg) e cliente IORedis
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts   # /api/v1/auth/*
│   │   └── auth.schemas.ts
│   ├── users/
│   ├── profiles/
│   │   └── profiles.routes.ts # /api/v1/profiles/*
│   ├── radar/
│   │   └── radar.routes.ts    # /api/v1/radar/nearby (PostGIS 10km)
│   ├── jobs/
│   ├── contracts/
│   │   └── contracts.routes.ts# /api/v1/contracts/*
│   └── reviews/
│       ├── reviews.routes.ts  # /api/v1/reviews/public
│       └── secret.routes.ts   # /api/v1/reviews/confidential
└── shared/
    ├── middlewares/
    │   ├── authenticate.ts    # Hook de verificação JWT
    │   └── role-guard.ts      # Verificação de empregador verificado
    └── utils/
```

#### C. Endpoints da API Fastify

1. **Autenticação e Sessão**:
   - `POST /api/v1/auth/register` — Cadastro com perfil (Freelancer / Empregador)
   - `POST /api/v1/auth/login` — Autenticação, emissão de Access Token e cookie Refresh Token
   - `POST /api/v1/auth/refresh` — Rotação silenciosa de tokens via cookie HttpOnly
   - `POST /api/v1/auth/logout` — Revogação de sessão no Redis e deleção do cookie
   - `GET  /api/v1/auth/sessions` — Listagem de dispositivos ativos
   - `DELETE /api/v1/auth/sessions/:id` — Logout remoto de dispositivo

2. **Perfis, Verificações e Feed**:
   - `GET  /api/v1/profiles/:id` — Perfil público, portfólio, endossos e selos
   - `PATCH /api/v1/profiles/availability` — Alterna status (Online, Offline, Urgência) no Redis e Postgres
   - `POST /api/v1/profiles/verification-request` — Envio de documentos (CNH/Antecedentes)
   - `GET  /api/v1/feed` — Publicações de certificados e rotinas com selo de verificação

3. **Radar de Urgência (PostGIS)**:
   - `GET  /api/v1/radar/urgency` — Busca de cuidadores com `urgency_mode = true` e distância $\le 10\text{km}$
   - `POST /api/v1/radar/ping-location` — Atualização periódica de geolocalização do prestador

4. **Contratos e Negociação**:
   - `POST /api/v1/contracts/propose` — Emissão de proposta vinculada à vaga
   - `PATCH /api/v1/contracts/:id/accept` — Aceite mútuo e geração de minuta com hash
   - `PATCH /api/v1/contracts/:id/complete` — Finalização do serviço liberando as avaliações

5. **Sistema de Avaliação Dupla**:
   - `POST /api/v1/reviews/public` — Avaliação pública atrelada a `contract_id` com status `completed`
   - `GET  /api/v1/reviews/freelancer/:id/public` — Lista pública de avaliações
   - `POST /api/v1/reviews/secret` — Avaliação confidencial comportamental restrita
   - `GET  /api/v1/reviews/freelancer/:id/secret` — Acesso exclusivo para empregadores auditados

---

### 5. Implementation Roadmap & Verification

1. **Configuração e Metadados**:
   - Configurar `metadata.json` e `<head>` em `index.html` com o nome e premissa da plataforma.
2. **Estrutura de Estado e Dados**:
   - Módulos de tipagem TypeScript com perfis, badges de confiança, contratos, radar geoespacial e autenticação.
3. **Módulos do Frontend**:
   - Visão do Freelancer com portfólio detalhado, badges de checagem, toggle de urgência e estatísticas.
   - Painel da Rede Sigilosa com trava de contrato e relatórios anônimos.
   - Radar de Urgência com mapa visual e cálculo de raio de 10km.
   - Minuta e gerador interativo de contrato digital assinado.
   - Console do Tech Lead contendo arquitetura de rotas, middleware de autenticação completo e simulador de SQL PostGIS.
4. **Verificação**:
   - Execução de `compile_applet` garantindo zero erros de tipos ou de build.
