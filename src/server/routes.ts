import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.ts';
import { getInitials } from '../lib/utils.ts';
import {
  contractsTable,
  feedPostsTable,
  jobAnnouncementsTable,
  jobApplicantsTable,
  profilesTable,
  publicReviewsTable,
  secretEvaluationsTable,
  sessionsTable,
  usersTable,
} from '../db/schema.ts';
import { DEMO_PASSWORD_PLAIN, resetAndSeedDatabase } from '../db/seed.ts';
import {
  authenticateRequest,
  clearRefreshCookie,
  createSessionAndIssueTokens,
  hashToken,
  mapUserRowToAuthUser,
  REFRESH_COOKIE_NAME,
  signAccessToken,
} from './auth.ts';
import type { AuthenticatedRequest } from './auth.ts';
import {
  calculateHaversineDistanceKm,
  DEFAULT_ORIGIN_LAT,
  DEFAULT_ORIGIN_LNG,
} from './geo.ts';
import type {
  ActiveSession,
  Contract,
  FeedPost,
  FreelancerProfile,
  JobAnnouncement,
  JobApplicant,
  PublicReview,
  RadarFreelancer,
  SecretEvaluation,
} from '../types/index.ts';

export const apiRouter = Router();

// --- Row Mappers ---

function mapProfileRow(row: typeof profilesTable.$inferSelect): FreelancerProfile {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    title: row.title,
    category: row.category,
    bio: row.bio,
    city: row.city,
    neighborhood: row.neighborhood,
    hourlyRate: row.hourlyRate,
    dailyRate: row.dailyRate,
    experienceYears: row.experienceYears,
    availability: row.availability as FreelancerProfile['availability'],
    urgencyRadiusKm: row.urgencyRadiusKm,
    lat: row.lat,
    lng: row.lng,
    completedContractsCount: row.completedContractsCount,
    publicRating: row.publicRating,
    publicReviewCount: row.publicReviewCount,
    badges: JSON.parse(row.badgesJson),
    skills: JSON.parse(row.skillsJson),
    certifications: JSON.parse(row.certificationsJson),
  };
}

function mapContractRow(row: typeof contractsTable.$inferSelect): Contract {
  return {
    id: row.id,
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    employerId: row.employerId,
    employerName: row.employerName,
    freelancerId: row.freelancerId,
    freelancerName: row.freelancerName,
    category: row.category,
    type: row.type as Contract['type'],
    status: row.status as Contract['status'],
    startDate: row.startDate,
    endDate: row.endDate ?? undefined,
    agreedRate: row.agreedRate,
    rateType: row.rateType as Contract['rateType'],
    weeklyHours: row.weeklyHours ?? undefined,
    locationAddress: row.locationAddress,
    clauses: JSON.parse(row.clausesJson),
    securityHash: row.securityHash,
    employerSignedAt: row.employerSignedAt ?? undefined,
    freelancerSignedAt: row.freelancerSignedAt ?? undefined,
    canReview: Boolean(row.canReview),
  };
}

function mapPublicReviewRow(
  row: typeof publicReviewsTable.$inferSelect
): PublicReview {
  return {
    id: row.id,
    contractId: row.contractId,
    freelancerId: row.freelancerId,
    employerName: row.employerName,
    employerType: row.employerType,
    rating: row.rating,
    comment: row.comment,
    date: row.date,
    serviceCategory: row.serviceCategory,
    contractPeriod: row.contractPeriod,
  };
}

function mapSecretEvalRow(
  row: typeof secretEvaluationsTable.$inferSelect
): SecretEvaluation {
  return {
    id: row.id,
    contractId: row.contractId,
    freelancerId: row.freelancerId,
    evaluatedAt: row.evaluatedAt,
    relationshipDuration: row.relationshipDuration,
    honestyScore: row.honestyScore,
    punctualityScore: row.punctualityScore,
    emotionalStabilityScore: row.emotionalStabilityScore,
    discretionConfidentialityScore: row.discretionConfidentialityScore,
    reactionUnderCrisisScore: row.reactionUnderCrisisScore,
    wouldRehirePrivately: Boolean(row.wouldRehirePrivately),
    privateNotes: row.privateNotes,
    hasVerifiedContract: Boolean(row.hasVerifiedContract),
  };
}

function mapFeedPostRow(row: typeof feedPostsTable.$inferSelect): FeedPost {
  return {
    id: row.id,
    authorId: row.authorId,
    authorName: row.authorName,
    authorRole: row.authorRole,
    authorCategory: row.authorCategory,
    avatarSeed: row.avatarSeed,
    verifiedBadgesCount: row.verifiedBadgesCount,
    createdAt: row.createdAt,
    content: row.content,
    type: row.type as FeedPost['type'],
    mediaTitle: row.mediaTitle ?? undefined,
    mediaSubtext: row.mediaSubtext ?? undefined,
    likesCount: row.likesCount,
    endorsementsCount: row.endorsementsCount,
    hasVerifiedExEmployerEndorsement: Boolean(
      row.hasVerifiedExEmployerEndorsement
    ),
    endorsedByEmployer: row.endorsedByEmployer ?? undefined,
  };
}

function buildJobAnnouncements(includeConfidentialNotes: boolean): JobAnnouncement[] {
  const jobs = db
    .select()
    .from(jobAnnouncementsTable)
    .orderBy(desc(jobAnnouncementsTable.createdAt))
    .all();
  const allApplicants = db.select().from(jobApplicantsTable).all();

  return jobs.map((job) => {
    const jobApps: JobApplicant[] = allApplicants
      .filter((a) => a.announcementId === job.id)
      .map((a) => ({
        id: a.id,
        candidateId: a.candidateId,
        candidateName: a.candidateName,
        candidateRole: a.candidateRole,
        avatarSeed: a.avatarSeed ?? undefined,
        rating: a.rating,
        reviewCount: a.reviewCount,
        distanceKm: a.distanceKm,
        salaryExpectation: a.salaryExpectation,
        stage: a.stage as JobApplicant['stage'],
        appliedDate: a.appliedDate,
        badges: JSON.parse(a.badgesJson),
        coverNote: a.coverNote,
        contractId: a.contractId ?? undefined,
        confidentialFeedbackSnippet: includeConfidentialNotes
          ? a.confidentialFeedbackSnippet ?? undefined
          : undefined,
      }));

    return {
      id: job.id,
      title: job.title,
      employerId: job.employerId,
      employerName: job.employerName,
      employerType: job.employerType,
      location: job.location,
      distanceKm: job.distanceKm,
      workSchedule: job.workSchedule,
      contractType: job.contractType as JobAnnouncement['contractType'],
      rateDescription: job.rateDescription,
      rateAmount: job.rateAmount,
      postedAt: job.postedAt,
      status: job.status as JobAnnouncement['status'],
      urgency: Boolean(job.urgency),
      description: job.description,
      responsibilities: JSON.parse(job.responsibilitiesJson),
      requiredBadges: JSON.parse(job.requiredBadgesJson),
      benefits: JSON.parse(job.benefitsJson),
      applicants: jobApps,
    };
  });
}

// =========================================================================
// 1. HEALTH & METADATA
// =========================================================================

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    engine: 'Express + Drizzle ORM + SQLite (WAL)',
    demoDefaultPassword: DEMO_PASSWORD_PLAIN,
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// 2. AUTHENTICATION & SESSIONS
// =========================================================================

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(4, 'A senha deve ter no mínimo 4 caracteres.'),
});

apiRouter.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Dados inválidos.' });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();

  if (!userRow) {
    res.status(401).json({
      error: 'Conta não encontrada. Cadastre-se gratuitamente ou use uma conta de demonstração.',
    });
    return;
  }

  const validPassword = await bcrypt.compare(parsed.data.password, userRow.passwordHash);
  if (!validPassword) {
    res.status(401).json({
      error: `Senha incorreta. (Para contas demo, a senha padrão é "${DEMO_PASSWORD_PLAIN}")`,
    });
    return;
  }

  const result = createSessionAndIssueTokens(req, res, userRow);
  res.json(result);
});

const registerSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo.'),
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  role: z.enum(['freelancer', 'employer']),
  category: z.string().optional(),
  dailyRate: z.number().min(50).optional(),
});

apiRouter.post('/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Dados inválidos.' });
    return;
  }

  const { name, password, role, category, dailyRate } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const existing = db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();

  if (existing) {
    res.status(409).json({ error: 'Este e-mail já está cadastrado no TrustLink.' });
    return;
  }

  const userId = role === 'employer' ? `emp-${crypto.randomUUID().slice(0, 8)}` : `usr-${crypto.randomUUID().slice(0, 8)}`;
  const profileId = role === 'freelancer' ? `fl-${crypto.randomUUID().slice(0, 8)}` : null;
  const passwordHash = await bcrypt.hash(password, 10);
  const nowIso = new Date().toISOString();
  const resolvedCategory = category?.trim() || 'Cuidadora de Idosos';
  const resolvedTitle =
    role === 'employer'
      ? 'Família Contratante Verificada'
      : `${resolvedCategory} · Perfil Verificado`;

  db.insert(usersTable)
    .values({
      id: userId,
      email,
      passwordHash,
      name: name.trim(),
      role,
      title: resolvedTitle,
      avatarInitials: getInitials(name),
      isVerified: true,
      freelancerProfileId: profileId,
      createdAt: nowIso,
    })
    .run();

  if (role === 'freelancer' && profileId) {
    const rate = dailyRate || 320;
    db.insert(profilesTable)
      .values({
        id: profileId,
        userId,
        fullName: name.trim(),
        title: resolvedTitle,
        category: resolvedCategory,
        radarCategory: 'Cuidado de Idosos',
        bio: 'Profissional recém-cadastrado(a) na rede TrustLink com identidade verificada e compromisso com atendimento humanizado e sigilo familiar.',
        city: 'São Paulo',
        neighborhood: 'Consolação / Região Central',
        hourlyRate: Math.round(rate / 8),
        dailyRate: rate,
        experienceYears: 3,
        availability: 'online',
        urgencyRadiusKm: 10,
        lat: -23.558 + (Math.random() - 0.5) * 0.03,
        lng: -46.662 + (Math.random() - 0.5) * 0.03,
        responseTimeMinutes: 15,
        phoneMasked: '(11) 98900-****',
        completedContractsCount: 0,
        publicRating: 5.0,
        publicReviewCount: 0,
        badgesJson: JSON.stringify([
          {
            id: `bdg-${crypto.randomUUID().slice(0, 6)}`,
            type: 'facial_biometrics',
            title: 'Identidade Biométrica Validada',
            issuer: 'TrustLink ID Check',
            verifiedAt: new Date().toLocaleDateString('pt-BR'),
            expiresAt: '10/2028',
            status: 'verified',
            documentHash: crypto.randomBytes(16).toString('hex'),
            details: 'Conferência documental concluída no cadastro inicial.',
          },
        ]),
        skillsJson: JSON.stringify([]),
        certificationsJson: JSON.stringify([]),
      })
      .run();
  }

  const createdUserRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .get()!;

  const result = createSessionAndIssueTokens(req, res, createdUserRow);
  res.status(201).json(result);
});

const demoLoginSchema = z.object({
  role: z.enum(['freelancer', 'employer']),
});

apiRouter.post('/auth/demo-login', (req, res) => {
  const parsed = demoLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Perfil demo inválido.' });
    return;
  }

  const targetEmail =
    parsed.data.role === 'employer'
      ? 'beatriz.fontana@hospital.org'
      : 'maria.clara@trustlink.org';

  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, targetEmail))
    .get();

  if (!userRow) {
    res.status(404).json({ error: 'Usuário de demonstração não encontrado no banco.' });
    return;
  }

  const result = createSessionAndIssueTokens(req, res, userRow);
  res.json(result);
});

apiRouter.post('/auth/refresh', (req, res) => {
  const rawCookie = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!rawCookie || !rawCookie.includes(':')) {
    res.status(401).json({ error: 'Refresh cookie ausente.' });
    return;
  }

  const [sessionId, rawToken] = rawCookie.split(':');
  const sessionRow = db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId))
    .get();

  if (!sessionRow || sessionRow.expiresAt < Date.now()) {
    clearRefreshCookie(req, res);
    res.status(401).json({ error: 'Sessão expirada.' });
    return;
  }

  const incomingHash = hashToken(rawToken);
  if (incomingHash !== sessionRow.refreshTokenHash) {
    db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId)).run();
    clearRefreshCookie(req, res);
    res.status(403).json({ error: 'Token de atualização inválido. Sessão encerrada.' });
    return;
  }

  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sessionRow.userId))
    .get();

  if (!userRow) {
    clearRefreshCookie(req, res);
    res.status(401).json({ error: 'Usuário não encontrado.' });
    return;
  }

  // Token Rotation: rotate refresh token hash in SQLite
  const nextRawRefresh = crypto.randomBytes(32).toString('hex');
  const nextHash = hashToken(nextRawRefresh);
  db.update(sessionsTable)
    .set({
      refreshTokenHash: nextHash,
      lastActive: 'Agora mesmo',
    })
    .where(eq(sessionsTable.id, sessionId))
    .run();

  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(REFRESH_COOKIE_NAME, `${sessionId}:${nextRawRefresh}`, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/api/v1',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const accessToken = signAccessToken({
    sub: userRow.id,
    role: userRow.role as 'freelancer' | 'employer',
    name: userRow.name,
    email: userRow.email,
    sessionId,
    freelancerProfileId: userRow.freelancerProfileId ?? undefined,
  });

  res.json({
    accessToken,
    user: mapUserRowToAuthUser(userRow),
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  const rawCookie = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (rawCookie && rawCookie.includes(':')) {
    const [sessionId] = rawCookie.split(':');
    db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId)).run();
  }
  clearRefreshCookie(req, res);
  res.json({ success: true });
});

apiRouter.get('/auth/me', authenticateRequest, (req: AuthenticatedRequest, res) => {
  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.authUser!.sub))
    .get();

  if (!userRow) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }

  res.json({ user: mapUserRowToAuthUser(userRow) });
});

apiRouter.get('/auth/sessions', authenticateRequest, (req: AuthenticatedRequest, res) => {
  const rows = db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, req.authUser!.sub))
    .orderBy(desc(sessionsTable.createdAt))
    .all();

  const sessions: ActiveSession[] = rows.map((r) => ({
    id: r.id,
    device: r.device,
    browser: r.browser,
    ip: r.ip,
    location: r.location,
    lastActive: r.id === req.authUser!.sessionId ? 'Agora mesmo (Ativa)' : r.lastActive,
    isCurrent: r.id === req.authUser!.sessionId,
    expiresInMinutes: Math.max(1, Math.round((r.expiresAt - Date.now()) / 60000)),
  }));

  res.json({ sessions });
});

apiRouter.delete(
  '/auth/sessions/:id',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const targetId = String(req.params.id);
    db.delete(sessionsTable)
      .where(
        and(
          eq(sessionsTable.id, targetId),
          eq(sessionsTable.userId, req.authUser!.sub)
        )
      )
      .run();

    res.json({ success: true });
  }
);

// =========================================================================
// 3. BOOTSTRAP WORKSPACE DATA (ROLE-FILTERED FOR CONFIDENTIALITY)
// =========================================================================

apiRouter.get('/bootstrap', authenticateRequest, (req: AuthenticatedRequest, res) => {
  const authUser = req.authUser!;
  const isEmployer = authUser.role === 'employer';

  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, authUser.sub))
    .get();

  const profiles = db.select().from(profilesTable).all().map(mapProfileRow);
  const contracts = db
    .select()
    .from(contractsTable)
    .orderBy(desc(contractsTable.createdAt))
    .all()
    .map(mapContractRow);
  const publicReviews = db
    .select()
    .from(publicReviewsTable)
    .all()
    .map(mapPublicReviewRow);

  // Regra de Sigilo no Backend: Freelancers NUNCA recebem avaliações sigilosas pela rede
  const secretEvaluations = isEmployer
    ? db.select().from(secretEvaluationsTable).all().map(mapSecretEvalRow)
    : [];

  const jobAnnouncements = buildJobAnnouncements(isEmployer);

  const candidateProfileId = authUser.freelancerProfileId || '';
  const appliedJobIds = candidateProfileId
    ? db
        .select({ announcementId: jobApplicantsTable.announcementId })
        .from(jobApplicantsTable)
        .where(eq(jobApplicantsTable.candidateId, candidateProfileId))
        .all()
        .map((r) => r.announcementId)
    : [];

  const feedPosts = db
    .select()
    .from(feedPostsTable)
    .all()
    .map(mapFeedPostRow);

  res.json({
    user: userRow ? mapUserRowToAuthUser(userRow) : null,
    profiles,
    contracts,
    publicReviews,
    secretEvaluations,
    jobAnnouncements,
    appliedJobIds,
    feedPosts,
  });
});

// =========================================================================
// 4. PROFILES & GEOSPATIAL HAVERSINE RADAR
// =========================================================================

const availabilitySchema = z.object({
  status: z.enum(['online', 'offline', 'urgency']),
});

apiRouter.patch(
  '/profiles/:id/availability',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const profileId = String(req.params.id);
    const parsed = availabilitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Status de disponibilidade inválido.' });
      return;
    }

    const existing = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, profileId))
      .get();

    if (!existing) {
      res.status(404).json({ error: 'Perfil profissional não encontrado.' });
      return;
    }

    if (
      req.authUser!.role !== 'freelancer' ||
      (req.authUser!.freelancerProfileId !== profileId &&
        req.authUser!.sub !== existing.userId)
    ) {
      res.status(403).json({
        error: 'Apenas o próprio profissional pode alterar sua disponibilidade.',
      });
      return;
    }

    db.update(profilesTable)
      .set({ availability: parsed.data.status })
      .where(eq(profilesTable.id, profileId))
      .run();

    const updated = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, profileId))
      .get()!;

    res.json({ profile: mapProfileRow(updated) });
  }
);

apiRouter.get('/radar/nearby', authenticateRequest, (req, res) => {
  const originLat = Number(req.query.lat) || DEFAULT_ORIGIN_LAT;
  const originLng = Number(req.query.lng) || DEFAULT_ORIGIN_LNG;
  const maxRadiusKm = Math.min(50, Math.max(1, Number(req.query.radiusKm) || 10));
  const category = String(req.query.category || 'all');
  const urgencyOnly = String(req.query.urgencyOnly ?? 'true') === 'true';

  const rows = db.select().from(profilesTable).all();

  const nearby: RadarFreelancer[] = rows
    .map((row) => {
      const distanceKm = calculateHaversineDistanceKm(
        originLat,
        originLng,
        row.lat,
        row.lng
      );
      const parsedBadges = JSON.parse(row.badgesJson) as Array<{ title: string }>;
      return {
        id: row.id,
        name: row.fullName,
        role: row.title,
        category: row.radarCategory,
        lat: row.lat,
        lng: row.lng,
        distanceKm,
        urgencyStatus: row.availability as RadarFreelancer['urgencyStatus'],
        rating: row.publicRating,
        reviewsCount: row.publicReviewCount,
        hourlyRate: row.hourlyRate,
        dailyRate: row.dailyRate,
        responseTimeMinutes: row.responseTimeMinutes,
        badges: parsedBadges.map((b) => b.title),
        phoneMasked: row.phoneMasked,
      };
    })
    .filter((fl) => {
      if (fl.distanceKm > maxRadiusKm) return false;
      if (urgencyOnly && fl.urgencyStatus !== 'urgency') return false;
      if (category !== 'all' && fl.category !== category) return false;
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    origin: { lat: originLat, lng: originLng },
    radiusKm: maxRadiusKm,
    count: nearby.length,
    freelancers: nearby,
  });
});

// =========================================================================
// 5. DIGITAL CONTRACTS (PROPOSAL, SIGNATURE, COMPLETION)
// =========================================================================

const createContractSchema = z.object({
  freelancerId: z.string().min(1),
  candidateName: z.string().min(2),
  role: z.string().min(2),
  rate: z.number().positive(),
  jobId: z.string().optional(),
  jobTitle: z.string().optional(),
  rateType: z.enum(['hourly', 'daily', 'monthly']).optional(),
  type: z.enum(['diario', 'mensal_fixo', 'plantao_urgencia']).optional(),
});

apiRouter.post('/contracts', authenticateRequest, (req: AuthenticatedRequest, res) => {
  if (req.authUser!.role !== 'employer') {
    res.status(403).json({ error: 'Apenas contratantes podem emitir propostas contratuais.' });
    return;
  }

  const parsed = createContractSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados da proposta inválidos.' });
    return;
  }

  const { freelancerId, candidateName, role, rate, jobId, jobTitle, rateType, type } =
    parsed.data;

  const id = `ctr-${crypto.randomUUID().slice(0, 8)}`;
  const resolvedJobId = jobId || `job-${crypto.randomUUID().slice(0, 8)}`;
  const resolvedTitle = jobTitle || `Contrato de Prestação de Serviços - ${role}`;
  const employerId = req.authUser!.sub;
  const employerName = `${req.authUser!.name} (Família Verificada)`;
  const signedTimestamp = `${new Date().toLocaleDateString('pt-BR')} às ${new Date()
    .toLocaleTimeString('pt-BR')
    .slice(0, 5)}`;
  const nowIso = new Date().toISOString();

  const clauses = [
    'Cláusula 1ª: Objeto - Prestação de serviços com zelo profissional e humanizado.',
    'Cláusula 2ª: Sigilo e Confidencialidade - Obrigação irrestrita de não divulgação de informações da residência (LGPD).',
    'Cláusula 3ª: Dupla Avaliação - Inserção de relatórios sigilosos condicionada estritamente ao término formal do contrato.',
  ];

  const securityHash = crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        id,
        resolvedJobId,
        employerId,
        freelancerId,
        rate,
        clauses,
        signedTimestamp,
      })
    )
    .digest('hex');

  db.insert(contractsTable)
    .values({
      id,
      jobId: resolvedJobId,
      jobTitle: resolvedTitle,
      employerId,
      employerName,
      freelancerId,
      freelancerName: candidateName,
      category: role,
      type: type || 'diario',
      status: 'pending_signature',
      startDate: new Date().toLocaleDateString('pt-BR'),
      endDate: null,
      agreedRate: rate,
      rateType: rateType || 'daily',
      weeklyHours: null,
      locationAddress: 'Rua Bela Cintra, 1420 - Consolação, São Paulo/SP',
      clausesJson: JSON.stringify(clauses),
      securityHash,
      employerSignedAt: signedTimestamp,
      freelancerSignedAt: null,
      canReview: false,
      createdAt: nowIso,
    })
    .run();

  const row = db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, id))
    .get()!;

  res.status(201).json({ contract: mapContractRow(row) });
});

apiRouter.patch(
  '/contracts/:id/sign',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const contractId = String(req.params.id);
    const existing = db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId))
      .get();

    if (!existing) {
      res.status(404).json({ error: 'Contrato não encontrado.' });
      return;
    }

    if (
      req.authUser!.role !== 'freelancer' ||
      (req.authUser!.freelancerProfileId !== existing.freelancerId &&
        req.authUser!.name !== existing.freelancerName)
    ) {
      res.status(403).json({
        error: 'Apenas o profissional destinatário deste contrato pode assiná-lo.',
      });
      return;
    }

    if (existing.status !== 'pending_signature') {
      res.status(400).json({ error: 'Este contrato já foi assinado ou encerrado.' });
      return;
    }

    const signedAt = `${new Date().toLocaleDateString('pt-BR')} às ${new Date()
      .toLocaleTimeString('pt-BR')
      .slice(0, 5)}`;

    db.update(contractsTable)
      .set({
        freelancerSignedAt: signedAt,
        status: 'active',
      })
      .where(eq(contractsTable.id, contractId))
      .run();

    const updated = db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId))
      .get()!;

    res.json({ contract: mapContractRow(updated) });
  }
);

apiRouter.patch(
  '/contracts/:id/complete',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const contractId = String(req.params.id);
    const existing = db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId))
      .get();

    if (!existing) {
      res.status(404).json({ error: 'Contrato não encontrado.' });
      return;
    }

    if (req.authUser!.role !== 'employer' || existing.employerId !== req.authUser!.sub) {
      res.status(403).json({
        error: 'Apenas o contratante titular pode encerrar formalmente este contrato.',
      });
      return;
    }

    if (existing.status !== 'active') {
      res.status(400).json({
        error: 'Apenas contratos EM VIGÊNCIA podem ser marcados como concluídos.',
      });
      return;
    }

    const endDate = new Date().toLocaleDateString('pt-BR');
    db.update(contractsTable)
      .set({
        status: 'completed',
        endDate,
        canReview: true,
      })
      .where(eq(contractsTable.id, contractId))
      .run();

    const profile = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, existing.freelancerId))
      .get();

    if (profile) {
      db.update(profilesTable)
        .set({ completedContractsCount: profile.completedContractsCount + 1 })
        .where(eq(profilesTable.id, profile.id))
        .run();
    }

    const updated = db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId))
      .get()!;

    res.json({ contract: mapContractRow(updated) });
  }
);

// =========================================================================
// 6. CONFIDENTIAL EVALUATIONS (STRICT COMPLETED CONTRACT VALIDATION)
// =========================================================================

const createSecretReviewSchema = z.object({
  contractId: z.string().min(1),
  freelancerId: z.string().min(1),
  honestyScore: z.number().min(1).max(10),
  punctualityScore: z.number().min(1).max(10),
  discretionConfidentialityScore: z.number().min(1).max(10),
  wouldRehirePrivately: z.boolean(),
  privateNotes: z.string().min(5, 'Descreva o relato comportamental com pelo menos 5 caracteres.'),
});

apiRouter.post(
  '/reviews/secret',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    if (req.authUser!.role !== 'employer') {
      res.status(403).json({
        error: 'Acesso negado: Apenas contratantes verificados podem registrar avaliações sigilosas.',
      });
      return;
    }

    const parsed = createSecretReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Notas ou campos inválidos.',
      });
      return;
    }

    const {
      contractId,
      freelancerId,
      honestyScore,
      punctualityScore,
      discretionConfidentialityScore,
      wouldRehirePrivately,
      privateNotes,
    } = parsed.data;

    const contractRow = db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId))
      .get();

    if (!contractRow) {
      res.status(404).json({ error: 'Contrato informado não existe.' });
      return;
    }

    if (
      contractRow.employerId !== req.authUser!.sub ||
      contractRow.freelancerId !== freelancerId
    ) {
      res.status(403).json({
        error: 'Este contrato não pertence à sua conta com este profissional.',
      });
      return;
    }

    if (contractRow.status !== 'completed') {
      res.status(400).json({
        error: 'Regra Anti-Difamação: O contrato precisa estar CONCLUÍDO para liberar avaliação.',
      });
      return;
    }

    const id = `sec-${crypto.randomUUID().slice(0, 8)}`;
    const emotionalStabilityScore =
      Math.round(((honestyScore + punctualityScore) / 2) * 10) / 10;

    try {
      db.insert(secretEvaluationsTable)
        .values({
          id,
          contractId,
          employerId: req.authUser!.sub,
          freelancerId,
          evaluatedAt: new Date().toLocaleDateString('pt-BR'),
          relationshipDuration: `Contrato concluído (${contractRow.startDate})`,
          honestyScore,
          punctualityScore,
          emotionalStabilityScore,
          discretionConfidentialityScore,
          reactionUnderCrisisScore: honestyScore,
          wouldRehirePrivately,
          privateNotes: privateNotes.trim(),
          hasVerifiedContract: true,
        })
        .run();
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Erro ao gravar avaliação no banco.',
      });
      return;
    }

    const created = db
      .select()
      .from(secretEvaluationsTable)
      .where(eq(secretEvaluationsTable.id, id))
      .get()!;

    res.status(201).json({ evaluation: mapSecretEvalRow(created) });
  }
);

// =========================================================================
// 7. JOBS & APPLICANT PIPELINE
// =========================================================================

const createJobSchema = z.object({
  title: z.string().min(3),
  location: z.string().min(2),
  distanceKm: z.number().min(0.1).max(100),
  workSchedule: z.string().min(2),
  contractType: z.enum(['diario', 'mensal_fixo', 'plantao_urgencia']),
  rateAmount: z.number().min(50),
  urgency: z.boolean(),
  description: z.string().optional(),
});

apiRouter.post('/jobs', authenticateRequest, (req: AuthenticatedRequest, res) => {
  if (req.authUser!.role !== 'employer') {
    res.status(403).json({ error: 'Apenas contratantes podem publicar vagas.' });
    return;
  }

  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados da vaga inválidos.' });
    return;
  }

  const data = parsed.data;
  const id = `ann-${crypto.randomUUID().slice(0, 8)}`;
  const nowIso = new Date().toISOString();

  db.insert(jobAnnouncementsTable)
    .values({
      id,
      title: data.title.trim(),
      employerId: req.authUser!.sub,
      employerName: `${req.authUser!.name} (Residência Verificada)`,
      employerType: 'Residência Verificada · Membro Auditado TrustLink',
      location: `${data.location.trim()} · ${data.distanceKm.toFixed(1)} km de você`,
      distanceKm: data.distanceKm,
      workSchedule: data.workSchedule.trim(),
      contractType: data.contractType,
      rateDescription:
        data.contractType === 'mensal_fixo'
          ? `R$ ${data.rateAmount.toLocaleString('pt-BR')} / mês`
          : `R$ ${data.rateAmount.toLocaleString('pt-BR')} / plantão`,
      rateAmount: data.rateAmount,
      postedAt: 'Agora mesmo',
      status: 'active',
      urgency: data.urgency,
      description:
        data.description?.trim() ||
        'Oportunidade para assistência com cuidado humanizado e compromisso ético.',
      responsibilitiesJson: JSON.stringify([
        'Acompanhamento e suporte com zelo às necessidades diárias',
        'Controle dos horários de medicação e rotina do assistido',
        'Registro transparente dos acontecimentos do dia',
      ]),
      requiredBadgesJson: JSON.stringify([
        'Antecedentes Criminais PF e TJ',
        'Checagem Facial Biométrica',
        'Referências de Famílias Verificadas',
      ]),
      benefitsJson: JSON.stringify([
        'Ambiente familiar seguro e respeitoso',
        'Alimentação no local',
        'Contrato digital com garantia TrustLink',
      ]),
      createdAt: nowIso,
    })
    .run();

  const allJobs = buildJobAnnouncements(true);
  const created = allJobs.find((j) => j.id === id)!;
  res.status(201).json({ announcement: created });
});

const applyJobSchema = z.object({
  note: z.string().min(3),
});

apiRouter.post(
  '/jobs/:id/apply',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    if (req.authUser!.role !== 'freelancer') {
      res.status(403).json({ error: 'Apenas profissionais podem se candidatar às vagas.' });
      return;
    }

    const announcementId = String(req.params.id);
    const parsed = applyJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Informe uma mensagem de apresentação válida.' });
      return;
    }

    const jobRow = db
      .select()
      .from(jobAnnouncementsTable)
      .where(eq(jobAnnouncementsTable.id, announcementId))
      .get();

    if (!jobRow) {
      res.status(404).json({ error: 'Vaga não encontrada.' });
      return;
    }

    const profileRow = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, req.authUser!.freelancerProfileId || 'fl-101'))
      .get();

    if (!profileRow) {
      res.status(404).json({ error: 'Perfil profissional não encontrado.' });
      return;
    }

    // Remove previous application from same candidate if any
    db.delete(jobApplicantsTable)
      .where(
        and(
          eq(jobApplicantsTable.announcementId, announcementId),
          eq(jobApplicantsTable.candidateId, profileRow.id)
        )
      )
      .run();

    const latestSecret = db
      .select()
      .from(secretEvaluationsTable)
      .where(eq(secretEvaluationsTable.freelancerId, profileRow.id))
      .get();

    const parsedBadges = JSON.parse(profileRow.badgesJson) as Array<{ title: string }>;
    const applicantId = `app-${crypto.randomUUID().slice(0, 8)}`;

    db.insert(jobApplicantsTable)
      .values({
        id: applicantId,
        announcementId,
        candidateId: profileRow.id,
        candidateName: profileRow.fullName,
        candidateRole: profileRow.title,
        avatarSeed: profileRow.fullName.split(' ')[0]?.toLowerCase() ?? 'user',
        rating: profileRow.publicRating,
        reviewCount: profileRow.publicReviewCount,
        distanceKm: jobRow.distanceKm,
        salaryExpectation: profileRow.dailyRate,
        stage: 'triagem',
        appliedDate: `Hoje às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`,
        badgesJson: JSON.stringify(parsedBadges.map((b) => b.title)),
        coverNote: parsed.data.note.trim(),
        contractId: null,
        confidentialFeedbackSnippet: latestSecret?.privateNotes ?? null,
      })
      .run();

    const updatedAnnouncements = buildJobAnnouncements(false);
    const updatedJob = updatedAnnouncements.find((j) => j.id === announcementId)!;
    res.status(201).json({ announcement: updatedJob });
  }
);

const updateStageSchema = z.object({
  stage: z.enum(['triagem', 'entrevista', 'proposta', 'contratado']),
  contractId: z.string().optional(),
});

apiRouter.patch(
  '/jobs/:announcementId/applicants/:applicantId/stage',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    if (req.authUser!.role !== 'employer') {
      res.status(403).json({ error: 'Apenas contratantes gerenciam o pipeline.' });
      return;
    }

    const announcementId = String(req.params.announcementId);
    const applicantId = String(req.params.applicantId);
    const parsed = updateStageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Etapa inválida.' });
      return;
    }

    const existing = db
      .select()
      .from(jobApplicantsTable)
      .where(
        and(
          eq(jobApplicantsTable.id, applicantId),
          eq(jobApplicantsTable.announcementId, announcementId)
        )
      )
      .get();

    if (!existing) {
      res.status(404).json({ error: 'Candidatura não encontrada.' });
      return;
    }

    db.update(jobApplicantsTable)
      .set({
        stage: parsed.data.stage,
        contractId: parsed.data.contractId ?? existing.contractId,
      })
      .where(eq(jobApplicantsTable.id, applicantId))
      .run();

    const allJobs = buildJobAnnouncements(true);
    const updatedJob = allJobs.find((j) => j.id === announcementId)!;
    res.json({ announcement: updatedJob });
  }
);

// =========================================================================
// 8. TRUST FEED
// =========================================================================

const createPostSchema = z.object({
  content: z.string().min(3),
  type: z.enum(['certification', 'daily_routine', 'milestone']),
  mediaTitle: z.string().optional(),
});

apiRouter.post('/feed', authenticateRequest, (req: AuthenticatedRequest, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Conteúdo inválido para publicação.' });
    return;
  }

  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.authUser!.sub))
    .get();

  const authorName = userRow?.name ?? req.authUser!.name;
  const authorRole = userRow?.title ?? 'Membro Auditado TrustLink';
  const id = `pst-${crypto.randomUUID().slice(0, 8)}`;

  db.insert(feedPostsTable)
    .values({
      id,
      authorId: req.authUser!.freelancerProfileId || req.authUser!.sub,
      authorName,
      authorRole,
      authorCategory:
        req.authUser!.role === 'freelancer'
          ? 'Profissional Verificado'
          : 'Família Auditada',
      avatarSeed: authorName.toLowerCase(),
      verifiedBadgesCount: 4,
      createdAt: 'Agora mesmo',
      content: parsed.data.content.trim(),
      type: parsed.data.type,
      mediaTitle:
        parsed.data.mediaTitle?.trim() ||
        (parsed.data.type === 'certification'
          ? 'Novo Certificado Profissional Auditado'
          : 'Registro de Rotina Humanizada'),
      mediaSubtext: 'Comprovante verificado pelo comitê de integridade TrustLink',
      likesCount: 1,
      endorsementsCount: 0,
      hasVerifiedExEmployerEndorsement: false,
      endorsedByEmployer: null,
    })
    .run();

  const row = db
    .select()
    .from(feedPostsTable)
    .where(eq(feedPostsTable.id, id))
    .get()!;

  res.status(201).json({ post: mapFeedPostRow(row) });
});

apiRouter.post('/feed/:id/like', authenticateRequest, (req, res) => {
  const postId = String(req.params.id);
  const existing = db
    .select()
    .from(feedPostsTable)
    .where(eq(feedPostsTable.id, postId))
    .get();

  if (!existing) {
    res.status(404).json({ error: 'Publicação não encontrada.' });
    return;
  }

  db.update(feedPostsTable)
    .set({ likesCount: existing.likesCount + 1 })
    .where(eq(feedPostsTable.id, postId))
    .run();

  const updated = db
    .select()
    .from(feedPostsTable)
    .where(eq(feedPostsTable.id, postId))
    .get()!;

  res.json({ post: mapFeedPostRow(updated) });
});

// =========================================================================
// 9. RESET DEMO DATABASE
// =========================================================================

apiRouter.post('/demo/reset', authenticateRequest, (req: AuthenticatedRequest, res) => {
  const previousRole = req.authUser!.role;
  resetAndSeedDatabase();

  const targetEmail =
    previousRole === 'employer'
      ? 'beatriz.fontana@hospital.org'
      : 'maria.clara@trustlink.org';

  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, targetEmail))
    .get()!;

  const sessionPayload = createSessionAndIssueTokens(req, res, userRow);
  res.json(sessionPayload);
});
