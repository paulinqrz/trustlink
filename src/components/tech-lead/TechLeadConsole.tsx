import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Database, 
  KeyRound, 
  MapPin, 
  Layers, 
  Check, 
  Copy, 
  Terminal, 
  RefreshCw, 
  ShieldAlert, 
  Lock, 
  Zap,
  Sliders,
  Play
} from 'lucide-react';
import { sampleActiveSessions } from '../../data/mockData';
import { ActiveSession } from '../../types';

export const TechLeadConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'auth_middleware' | 'postgis_query' | 'database_ddl'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Live Auth Simulator State
  const [accessTokenSeconds, setAccessTokenSeconds] = useState<number>(30); // 30s accelerated demo
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [authLogs, setAuthLogs] = useState<string[]>([
    '[INIT] Sessão iniciada. Access Token JWT (15min) emitido em memória.',
    '[REDIS] Chave de sessão criada: session:usr-901:fam-8891 (TTL: 30 dias)',
    '[COOKIE] Set-Cookie: refreshToken=rt_live_9921...; HttpOnly; Secure; SameSite=Strict'
  ]);
  const [sessions, setSessions] = useState<ActiveSession[]>(sampleActiveSessions);

  // Live PostGIS Query Simulator State
  const [simLat, setSimLat] = useState<number>(-23.5558);
  const [simLng, setSimLng] = useState<number>(-46.6601);
  const [simRadiusKm, setSimRadiusKm] = useState<number>(10);
  const [simUrgencyOnly, setSimUrgencyOnly] = useState<boolean>(true);

  // Countdown timer for auth simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setAccessTokenSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const triggerSilentRefresh = () => {
    setIsRefreshing(true);
    setAuthLogs(prev => [
      `[CLIENT] Access Token expirado detectado pelo Interceptor Axios/Fetch.`,
      `[CLIENT] Requisição silenciosa POST /api/v1/auth/refresh (Cookie HttpOnly enviado automaticamente).`,
      ...prev
    ]);

    setTimeout(() => {
      setIsRefreshing(false);
      setAccessTokenSeconds(30); // reset
      setAuthLogs(prev => [
        `[REDIS] Refresh token validado na família fam-8891. Token antigo invalidado (Token Rotation).`,
        `[AUTH] Novo Access Token JWT gerado e injetado nos headers do client sem interromper a navegação!`,
        ...prev
      ]);
    }, 700);
  };

  const revokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setAuthLogs(prev => [
      `[REDIS] DEL session:usr-901:${sessionId} executado com sucesso. Dispositivo deslogado remotamente!`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner: Tech Lead Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                TECH LEAD & SYSTEM ARCHITECTURE CONSOLE
              </span>
              <span className="text-xs text-slate-400 font-mono">Fastify · PostgreSQL + PostGIS · Redis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Engenharia da Plataforma "LinkedIn da Confiança"
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
              Estruturação técnica formal com especificações completas de APIs no Fastify, middleware de autenticação persistente com rotação de tokens no Redis e query geoespacial de alta performance em PostGIS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Fastify v4 / Node 22 Ready
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            1. Arquitetura Fastify & Rotas
          </button>

          <button
            onClick={() => setActiveTab('auth_middleware')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'auth_middleware'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            2. Autenticação Persistente & Redis
          </button>

          <button
            onClick={() => setActiveTab('postgis_query')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'postgis_query'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            3. PostGIS (Query Raio 10km)
          </button>

          <button
            onClick={() => setActiveTab('database_ddl')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'database_ddl'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            4. DDL & Regras de Banco
          </button>
        </div>
      </div>

      {/* SECTION 1: ARQUITETURA DE PASTAS E ROTAS FASTIFY */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  1. Arquitetura de Pastas e Roteamento Modular no Fastify
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Design escalável por domínios (Domain-Driven Structure) com schemas validados nativamente pelo Ajv do Fastify.
                </p>
              </div>

              <button
                onClick={() => handleCopyCode(fastifyTreeCode, 'tree')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-200"
              >
                {copiedSection === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'tree' ? 'Copiado!' : 'Copiar Árvore'}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {fastifyTreeCode}
            </pre>
          </div>

          {/* Endpoints Table Catalog */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Catálogo de Endpoints e Contratos REST da API
            </h3>
            <p className="text-xs text-slate-500">
              Todos os endpoints utilizam prefixo <code className="font-mono text-slate-800">/api/v1</code> e retorno em JSON tipado.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">Método & Rota</th>
                    <th className="p-3">Segurança</th>
                    <th className="p-3">Finalidade no Negócio</th>
                    <th className="p-3">Payload / Retorno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-semibold text-emerald-700">POST /api/v1/auth/login</td>
                    <td className="p-3 text-slate-500">Pública</td>
                    <td className="p-3 text-slate-800">Autentica usuário, gera JWT de 15min e seta Cookie HttpOnly com Refresh Token</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">Body: {`{ email, password }`} → Res: {`{ accessToken, user }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-semibold text-emerald-700">POST /api/v1/auth/refresh</td>
                    <td className="p-3 text-slate-500">Cookie HttpOnly</td>
                    <td className="p-3 text-slate-800">Renovação transparente de sessão sem deslogar o usuário (Token Rotation no Redis)</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">Cookie: refreshToken → Res: {`{ accessToken }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-semibold text-emerald-700">DELETE /api/v1/auth/sessions/:id</td>
                    <td className="p-3 text-slate-500">Bearer JWT</td>
                    <td className="p-3 text-slate-800">Logout remoto de outro dispositivo (invalida chave no Redis instantaneamente)</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">Params: sessionId → Res: {`{ success: true }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-semibold text-indigo-700">GET /api/v1/radar/nearby</td>
                    <td className="p-3 text-slate-500">Bearer JWT</td>
                    <td className="p-3 text-slate-800">Radar de Urgência: busca freelancers no raio de 10km com PostGIS (ST_DWithin)</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">Query: {`?lat=-23.55&lng=-46.66&radius=10000&urgency=true`}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-semibold text-amber-700">PATCH /api/v1/profiles/availability</td>
                    <td className="p-3 text-slate-500">Bearer (Freelancer)</td>
                    <td className="p-3 text-slate-800">Alterna status (Online / Offline / Urgência) no Redis e sincroniza no Postgres</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">Body: {`{ status: 'urgency', radiusKm: 10 }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-semibold text-slate-800">POST /api/v1/contracts/accept</td>
                    <td className="p-3 text-slate-500">Bearer JWT</td>
                    <td className="p-3 text-slate-800">Aceite mútuo de proposta com geração automática de contrato PDF e hash SHA-256</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">Body: {`{ proposalId, digitalSignature }`} → Res: {`{ contractPdfUrl, hash }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-semibold text-rose-700">POST /api/v1/reviews/secret</td>
                    <td className="p-3 text-slate-500">Empregador Auditado</td>
                    <td className="p-3 text-slate-800">Insere avaliação na Rede Sigilosa (estritamente condicionada a contract_id completed)</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">Body: {`{ contractId, honestyScore, discretionScore, notes }`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MIDDLEWARE DE AUTENTICAÇÃO JWT + REFRESH TOKEN + REDIS */}
      {activeTab === 'auth_middleware' && (
        <div className="space-y-6">
          {/* Interactive Live Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  SIMULADOR AO VIVO DE SESSÃO PERSISTENTE
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Ciclo de Vida do Access Token e Renovação Silenciosa via Redis
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={triggerSilentRefresh}
                  disabled={isRefreshing}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Disparar Refresh Silencioso
                </button>
              </div>
            </div>

            {/* Live Token Status Widget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block">Access Token JWT (Em Memória)</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold font-mono ${accessTokenSeconds > 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {accessTokenSeconds}s
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {accessTokenSeconds > 0 ? 'Válido' : 'Expirado (Aciona Refresh)'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full transition-all duration-1000 ${accessTokenSeconds > 5 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${(accessTokenSeconds / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block">Refresh Token (HttpOnly Cookie)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-indigo-400">30 dias</span>
                  <span className="text-[11px] text-emerald-400 font-mono">HttpOnly; SameSite=Strict</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Inacessível via JS (Proteção contra XSS)
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block">Sessão no Redis (Controle de Dispositivos)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">{sessions.length} ativas</span>
                  <span className="text-[11px] text-slate-400 font-mono">Família fam-8891</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Permite revogação remota instantânea
                </p>
              </div>
            </div>

            {/* Active Devices Revocation list */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-300 block mb-2 font-mono">
                DISPOSITIVOS CONECTADOS NO REDIS (LOGOUT REMOTO)
              </span>
              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{sess.device}</span>
                      <span className="text-slate-400 font-mono text-[11px]"> · {sess.browser} · IP: {sess.ip}</span>
                    </div>
                    {sess.isCurrent ? (
                      <span className="text-emerald-400 font-mono text-[11px]">Esta Sessão Atual</span>
                    ) : (
                      <button
                        onClick={() => revokeSession(sess.id)}
                        className="px-2.5 py-1 text-[11px] text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded transition-colors"
                      >
                        Revogar Acesso Remoto
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Terminal Logs */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 block mb-1 font-mono">
                TERMINAL DE LOGS DO REDIS & INTERCEPTOR:
              </span>
              <div className="p-3 bg-black rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto space-y-1">
                {authLogs.map((log, i) => (
                  <div key={i} className={log.includes('[REDIS]') ? 'text-indigo-400' : log.includes('[CLIENT]') ? 'text-amber-400' : 'text-emerald-400'}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Step-by-Step Architecture & Code */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    2. Lógica e Implementação do Middleware de Autenticação Fastify + Redis
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Garantia técnica de que o usuário nunca seja deslogado inesperadamente durante o uso da plataforma.
                  </p>
                </div>

                <button
                  onClick={() => handleCopyCode(fastifyAuthCode, 'authCode')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-200"
                >
                  {copiedSection === 'authCode' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'authCode' ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>

              <div className="space-y-4 mt-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <h4 className="font-semibold text-slate-900">Passo a Passo Arquitetural:</h4>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                    <li>
                      <strong>Login Inicial:</strong> O cliente envia credenciais para <code className="font-mono text-slate-900">POST /api/v1/auth/login</code>. A API valida com Bcrypt, gera um JWT de 15 minutos (retornado no corpo) e um Refresh Token UUID criptografado de 30 dias (injetado via cookie HttpOnly <code className="font-mono text-slate-900">SameSite=Strict; Secure; Path=/api/v1/auth</code>).
                    </li>
                    <li>
                      <strong>Registro da Sessão no Redis:</strong> Salva-se no Redis a chave <code className="font-mono text-slate-900">session:{"{userId}"}:{"{deviceFingerprint}"}</code> com o hash do Refresh Token, IP, User-Agent e status ativo.
                    </li>
                    <li>
                      <strong>Middleware de Autorização nas Rotas Protegidas:</strong> Hook <code className="font-mono text-slate-900">onRequest: app.authenticate</code> decodifica o JWT do cabeçalho <code className="font-mono text-slate-900">Authorization: Bearer</code> em menos de 1ms sem tocar no banco de dados.
                    </li>
                    <li>
                      <strong>Renovação Silenciosa (Silent Refresh):</strong> Se o JWT expirar durante o uso, o interceptor do frontend (Axios/Fetch) intercepta o status 401, pausa as requisições pendentes em fila, chama <code className="font-mono text-slate-900">POST /api/v1/auth/refresh</code>, recebe o novo JWT, atualiza os cabeçalhos e reexecuta as chamadas sem qualquer piscar de tela ou logout para o usuário.
                    </li>
                    <li>
                      <strong>Token Rotation & Detecção de Roubo:</strong> A cada refresh, o token antigo é invalidado no Redis e um novo é emitido. Se um refresh token antigo já usado for submetido, o Redis detecta reutilização indevida e encerra todas as sessões da família por segurança.
                    </li>
                  </ol>
                </div>

                <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {fastifyAuthCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: QUERY POSTGIS RAIO DE 10KM */}
      {activeTab === 'postgis_query' && (
        <div className="space-y-6">
          {/* Interactive SQL Simulator */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-700">
                  SIMULADOR INTERATIVO POSTGIS
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Execução da Query de Urgência no Raio Paramétrico
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                  SRID: 4326 (WGS 84 Geodésico)
                </span>
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Latitude de Origem: <span className="font-mono font-bold text-slate-900">{simLat}</span>
                </label>
                <input
                  type="range"
                  min={-23.65}
                  max={-23.45}
                  step={0.01}
                  value={simLat}
                  onChange={(e) => setSimLat(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Longitude de Origem: <span className="font-mono font-bold text-slate-900">{simLng}</span>
                </label>
                <input
                  type="range"
                  min={-46.75}
                  max={-46.55}
                  step={0.01}
                  value={simLng}
                  onChange={(e) => setSimLng(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Raio Máximo: <span className="font-mono font-bold text-slate-900">{simRadiusKm} km</span> ({simRadiusKm * 1000} metros)
                </label>
                <input
                  type="range"
                  min={2}
                  max={25}
                  step={1}
                  value={simRadiusKm}
                  onChange={(e) => setSimRadiusKm(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>
            </div>

            {/* Generated SQL Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  QUERY SQL GERADA EM TEMPO REAL:
                </span>
                <button
                  onClick={() => handleCopyCode(postgisQueryString(simLat, simLng, simRadiusKm), 'postgis')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  {copiedSection === 'postgis' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar SQL
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {postgisQueryString(simLat, simLng, simRadiusKm)}
              </pre>
            </div>
          </div>

          {/* Technical Documentation on PostGIS Best Practices */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              3. Melhores Práticas de Engenharia e Índices no PostgreSQL + PostGIS
            </h3>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="font-semibold text-slate-900">Por que utilizar PostGIS em vez de cálculo matemático puro (Haversine)?</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Índice GiST (Generalized Search Tree):</strong> Cria uma árvore R-Tree espacial. Sem índice, uma busca com fórmula de Haversine força um Table Scan completo em todas as linhas ($O(N)$). Com o índice GiST, a busca opera em $O(\log N)$, filtrando milhares de registros em frações de milissegundo.
                  </li>
                  <li>
                    <strong>Tipo <code className="font-mono text-slate-900">geography(Point, 4326)</code>:</strong> Considera a curvatura elipsoidal da Terra (WGS 84), fornecendo cálculos métricos reais sem distorção cartográfica. A função <code className="font-mono text-slate-900">ST_DWithin</code> já aceita a distância em metros diretamente!
                  </li>
                  <li>
                    <strong>Index-Condition Pushdown:</strong> O Postgres filtra primeiro pelo bounding box do índice GiST e apenas calcula a distância geodésica exata para os pontos que estão dentro do raio, minimizando uso de CPU.
                  </li>
                </ul>
              </div>

              <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {postgisDDLCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DDL DO BANCO E REGRAS DE INTEGRIDADE */}
      {activeTab === 'database_ddl' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  4. Esquema DDL do PostgreSQL com Restrição de Integridade para Avaliações
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regra de negócio inviolável: Avaliações públicas ou na Rede Sigilosa só podem ser gravadas se <code className="font-mono text-slate-800">contracts.status = 'completed'</code>.
                </p>
              </div>

              <button
                onClick={() => handleCopyCode(databaseDDLComplete, 'ddl')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-200"
              >
                {copiedSection === 'ddl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'ddl' ? 'Copiado!' : 'Copiar DDL'}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {databaseDDLComplete}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Raw Architecture Codes for Display and Copying
const fastifyTreeCode = `trustlink-api/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── app.ts                         # Registro de Plugins Fastify, Hooks e Tratamento de Erro
│   ├── server.ts                      # Boot do Fastify na porta 3000 e Graceful Shutdown
│   │
│   ├── config/
│   │   ├── env.ts                     # Schema de validação de ENV (Ajv/Envalid)
│   │   ├── postgres.ts                # Pool de conexão PostgreSQL (pg) com extensão PostGIS
│   │   └── redis.ts                   # Instância IORedis (Pub/Sub e Session Store)
│   │
│   ├── plugins/
│   │   ├── auth.plugin.ts             # Registra @fastify/jwt e @fastify/cookie
│   │   ├── cors.plugin.ts             # @fastify/cors configurado com credentials: true
│   │   └── rate-limit.plugin.ts       # Proteção contra brute force no login
│   │
│   ├── modules/
│   │   ├── auth/                      # Módulo de Autenticação & Sessão
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts        # Bcrypt, rotação de tokens, Redis session store
│   │   │   ├── auth.schemas.ts        # Fastify JSON Schemas para login e refresh
│   │   │   └── auth.routes.ts         # POST /login, POST /refresh, DELETE /sessions/:id
│   │   │
│   │   ├── profiles/                  # Perfis, Selos e Disponibilidade
│   │   │   ├── profiles.controller.ts
│   │   │   ├── profiles.service.ts
│   │   │   ├── profiles.schemas.ts
│   │   │   └── profiles.routes.ts     # GET /:id, PATCH /availability (Redis + Postgres)
│   │   │
│   │   ├── radar/                     # Radar de Urgência (PostGIS 10km)
│   │   │   ├── radar.controller.ts
│   │   │   ├── radar.service.ts       # Query ST_DWithin + ST_Distance
│   │   │   ├── radar.schemas.ts       # Validação de coords (?lat, ?lng, ?radius)
│   │   │   └── radar.routes.ts        # GET /nearby, POST /ping-location
│   │   │
│   │   ├── contracts/                 # Contratos Digitais & Aceite Mútuo
│   │   │   ├── contracts.controller.ts
│   │   │   ├── contracts.service.ts    # Geração de PDF via PDFKit, Hash SHA-256
│   │   │   └── contracts.routes.ts    # POST /propose, PATCH /:id/accept, PATCH /:id/complete
│   │   │
│   │   └── reviews/                   # Sistema de Avaliação Dupla (Pública & Sigilosa)
│   │       ├── reviews.controller.ts
│   │       ├── reviews.service.ts     # Validação estrita de contract_id concluído
│   │       ├── reviews.schemas.ts
│   │       ├── public-reviews.routes.ts
│   │       └── secret-reviews.routes.ts # Acesso restrito a empregadores verificados
│   │
│   └── shared/
│       ├── middlewares/
│       │   ├── authenticate.ts        # Hook preValidation: verifica JWT no Bearer
│       │   └── verify-role.ts         # Guard: exige perfil 'employer_verified'
│       └── utils/
│           ├── crypto.ts              # Hashes de integridade documental
│           └── s3-uploader.ts         # Upload de atestados e minutas no S3 via Presigned URLs`;

const fastifyAuthCode = `// src/modules/auth/auth.service.ts & middlewares/authenticate.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { redisClient } from '../../config/redis';

// 1. Hook de Autenticação onRequest nas rotas protegidas
export async function authenticateHook(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Decodifica o JWT rápido (15 min) presente no cabeçalho Authorization: Bearer <token>
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Access Token expirado ou inválido. Acione o endpoint /api/v1/auth/refresh silenciosamente.'
    });
  }
}

// 2. Endpoint de Login: emissão de Access Token + Refresh Token HttpOnly
export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as any;
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return reply.status(401).send({ message: 'Credenciais inválidas.' });
  }

  // A. Access Token curto (15 minutos)
  const accessToken = request.server.jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    { expiresIn: '15m' }
  );

  // B. Refresh Token UUID longo (30 dias) + Identificador de Família para rotação
  const familyId = crypto.randomUUID();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // C. Grava a sessão persistente no Redis
  const sessionKey = \`session:\${user.id}:\${familyId}\`;
  await redisClient.set(
    sessionKey,
    JSON.stringify({
      tokenHash,
      userAgent: request.headers['user-agent'] || 'unknown',
      ip: request.ip,
      createdAt: new Date().toISOString()
    }),
    'EX',
    30 * 24 * 60 * 60 // 30 dias em segundos
  );

  // D. Injeta o Refresh Token em Cookie HttpOnly Seguro
  reply.setCookie('refreshToken', \`\${familyId}:\${refreshToken}\`, {
    path: '/api/v1/auth',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60
  });

  return reply.send({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken
  });
}

// 3. Rotação Silenciosa de Refresh Token (Sem interromper navegação)
export async function refreshHandler(request: FastifyRequest, reply: FastifyReply) {
  const rawCookie = request.cookies.refreshToken;
  if (!rawCookie) {
    return reply.status(401).send({ message: 'Refresh token ausente no cookie.' });
  }

  const [familyId, refreshToken] = rawCookie.split(':');
  const user = await decodeSubjectFromCookieOrToken(request); // obtém userId
  const sessionKey = \`session:\${user.id}:\${familyId}\`;
  const sessionDataRaw = await redisClient.get(sessionKey);

  if (!sessionDataRaw) {
    // Tentativa de reutilização indevida ou sessão revogada remotamente
    reply.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return reply.status(403).send({ message: 'Sessão revogada ou expirada. Efetue login novamente.' });
  }

  const session = JSON.parse(sessionDataRaw);
  const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  if (session.tokenHash !== incomingHash) {
    // Alerta de segurança: Token roubado reutilizado! Invalida toda a família.
    await redisClient.del(sessionKey);
    reply.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return reply.status(403).send({ message: 'Violação de integridade. Sessão encerrada.' });
  }

  // ROTAÇÃO: Emite novo par e renova chave no Redis
  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  await redisClient.set(sessionKey, JSON.stringify({ ...session, tokenHash: newHash }), 'EX', 30 * 24 * 60 * 60);

  const newAccessToken = request.server.jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    { expiresIn: '15m' }
  );

  reply.setCookie('refreshToken', \`\${familyId}:\${newRefreshToken}\`, {
    path: '/api/v1/auth',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60
  });

  return reply.send({ accessToken: newAccessToken });
}`;

const postgisQueryString = (lat: number, lng: number, radiusKm: number) => `SELECT 
  p.id AS profile_id,
  p.full_name,
  p.category,
  p.daily_rate,
  p.hourly_rate,
  p.urgency_mode,
  p.urgency_response_minutes,
  -- Cálculo exato da distância geodésica em quilômetros via PostGIS:
  ROUND((ST_Distance(
    p.location, 
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
  ) / 1000.0)::numeric, 2) AS distance_km
FROM profiles p
WHERE 
  -- 1. Filtro espacial rápido utilizando o índice GiST (Raio em metros):
  ST_DWithin(
    p.location, 
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
    ${radiusKm * 1000}
  )
  -- 2. Filtro de urgência imediata ativa:
  AND p.urgency_mode = true
  AND p.is_identity_verified = true
-- 3. Ordenação por menor distância geodésica (mais próximo primeiro):
ORDER BY p.location <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography ASC
LIMIT 20;`;

const postgisDDLCode = `-- Instalação da extensão PostGIS no PostgreSQL
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabela de perfis com coluna de geografia espacial (WGS 84 SRID 4326)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    daily_rate NUMERIC(10, 2) NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    urgency_mode BOOLEAN DEFAULT false,
    urgency_response_minutes INT DEFAULT 20,
    is_identity_verified BOOLEAN DEFAULT false,
    
    -- Coluna espacial geodésica para latitude e longitude:
    location GEOGRAPHY(Point, 4326) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRÍTICO: Índice espacial GiST para garantir performance de sub-milissegundo
CREATE INDEX idx_profiles_location_gist 
ON profiles 
USING GIST (location);

-- Índice composto para acelerar buscas conjuntas de Urgência + Status
CREATE INDEX idx_profiles_urgency_verified 
ON profiles (urgency_mode, is_identity_verified);`;

const databaseDDLComplete = `-- 1. TABELA DE CONTRATOS
CREATE TYPE contract_status_enum AS ENUM (
    'draft', 
    'pending_signature', 
    'active', 
    'completed', 
    'cancelled'
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    employer_id UUID NOT NULL REFERENCES users(id),
    freelancer_id UUID NOT NULL REFERENCES users(id),
    agreed_rate NUMERIC(10, 2) NOT NULL,
    status contract_status_enum NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL,
    end_date DATE,
    terms_pdf_url TEXT,
    security_hash VARCHAR(64) NOT NULL,
    employer_signed_at TIMESTAMPTZ,
    freelancer_signed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_status ON contracts(status);

-- 2. REGRA DE VALIDAÇÃO: TRIGGER PARA GARANTIR CONTRATO CONCLUÍDO
-- Impede inserções em 'reviews' ou 'secret_evaluations' se o contrato não for 'completed'
CREATE OR REPLACE FUNCTION enforce_contract_completed_before_review()
RETURNS TRIGGER AS $$
DECLARE
    v_status contract_status_enum;
BEGIN
    SELECT status INTO v_status FROM contracts WHERE id = NEW.contract_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Vínculo Inválido: Contrato % não existe.', NEW.contract_id;
    END IF;

    IF v_status <> 'completed' THEN
        RAISE EXCEPTION 'Regra Anti-Difamação Violada: Avaliações públicas ou sigilosas exigem que o contrato % esteja no status COMPLETED. Status atual: %', 
            NEW.contract_id, v_status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABELA DE AVALIAÇÕES PÚBLICAS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    employer_id UUID NOT NULL REFERENCES users(id),
    freelancer_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_review_contract UNIQUE (contract_id, employer_id)
);

CREATE TRIGGER trg_check_contract_completed_public_review
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION enforce_contract_completed_before_review();

-- 4. TABELA DA REDE SIGILOSA (AVALIAÇÕES ANÔNIMAS COMPORTAMENTAIS)
CREATE TABLE secret_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    employer_id UUID NOT NULL REFERENCES users(id),
    freelancer_id UUID NOT NULL REFERENCES users(id),
    
    -- Traços comportamentais auditados (1 a 10)
    honesty_score NUMERIC(3, 1) NOT NULL CHECK (honesty_score >= 1.0 AND honesty_score <= 10.0),
    punctuality_score NUMERIC(3, 1) NOT NULL CHECK (punctuality_score >= 1.0 AND punctuality_score <= 10.0),
    emotional_stability_score NUMERIC(3, 1) NOT NULL CHECK (emotional_stability_score >= 1.0 AND emotional_stability_score <= 10.0),
    discretion_score NUMERIC(3, 1) NOT NULL CHECK (discretion_score >= 1.0 AND discretion_score <= 10.0),
    reaction_crisis_score NUMERIC(3, 1) NOT NULL CHECK (reaction_crisis_score >= 1.0 AND reaction_crisis_score <= 10.0),
    would_rehire_privately BOOLEAN NOT NULL DEFAULT true,
    private_notes TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_secret_contract UNIQUE (contract_id, employer_id)
);

CREATE TRIGGER trg_check_contract_completed_secret_review
BEFORE INSERT ON secret_evaluations
FOR EACH ROW EXECUTE FUNCTION enforce_contract_completed_before_review();`;
