import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.ts';
import { getInitials } from '../lib/utils.ts';
import {
  chatMessagesTable,
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
import {
  DEMO_PASSWORD_PLAIN,
  mapProfileToRadarCategory,
  resetAndSeedDatabase,
} from '../db/seed.ts';
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
  BillingCycle,
  ChatMessage,
  Contract,
  FeedPost,
  FreelancerProfile,
  HighlightPlan,
  JobAnnouncement,
  JobApplicant,
  PublicReview,
  RadarFreelancer,
  SecretEvaluation,
  VerificationBadge,
} from '../types/index.ts';

export const apiRouter = Router();

// --- Row Mappers ---

function mapProfileRow(row: typeof profilesTable.$inferSelect): FreelancerProfile {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    age: row.age,
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
    isVerified: Boolean(row.isVerified),
    highlightPlan: (row.highlightPlan || 'free') as HighlightPlan,
    billingCycle: (row.billingCycle || 'monthly') as BillingCycle,
    pixKey: row.pixKey,
    profileStats: {
      searchAppearances: row.searchAppearances,
      profileViews: row.profileViews,
      chatRequests: row.chatRequests,
    },
    completedContractsCount: row.completedContractsCount,
    publicRating: row.publicRating,
    publicReviewCount: row.publicReviewCount,
    badges: JSON.parse(row.badgesJson),
    skills: JSON.parse(row.skillsJson),
    certifications: JSON.parse(row.certificationsJson),
  };
}

function mapChatRow(row: typeof chatMessagesTable.$inferSelect): ChatMessage {
  return {
    id: row.id,
    employerId: row.employerId,
    employerName: row.employerName,
    freelancerId: row.freelancerId,
    freelancerName: row.freelancerName,
    senderRole: row.senderRole as 'employer' | 'freelancer',
    senderName: row.senderName,
    content: row.content,
    proposedAmount: row.proposedAmount ?? undefined,
    paymentMethod: (row.paymentMethod as 'pix' | 'platform' | null) ?? undefined,
    paymentStatus: (row.paymentStatus as 'pending' | 'paid' | null) ?? undefined,
    serviceDate: row.serviceDate ?? undefined,
    createdAt: row.createdAt,
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
    platform: 'Verilar',
    engine: 'Express + Drizzle ORM + SQLite (WebAssembly)',
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
      error: `Senha incorreta. (Para contas demo Verilar, a senha é "${DEMO_PASSWORD_PLAIN}")`,
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
  neighborhood: z.string().optional(),
});

apiRouter.post('/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Dados inválidos.' });
    return;
  }

  const { name, password, role, category, dailyRate, neighborhood } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const existing = db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();

  if (existing) {
    res.status(409).json({ error: 'Este e-mail já está cadastrado na Verilar.' });
    return;
  }

  const userId =
    role === 'employer'
      ? `emp-${crypto.randomUUID().slice(0, 8)}`
      : `usr-${crypto.randomUUID().slice(0, 8)}`;
  const profileId = role === 'freelancer' ? `fl-${crypto.randomUUID().slice(0, 8)}` : null;
  const passwordHash = await bcrypt.hash(password, 10);
  const nowIso = new Date().toISOString();
  const resolvedCategory = category?.trim() || 'Doméstica / Diarista';
  const resolvedTitle =
    role === 'employer'
      ? 'Família Contratante Verilar'
      : `${resolvedCategory} · Aguardando Verificação Gratuita`;

  // Regra Slide 4: prestadora só aparece nas buscas depois de verificada
  const initialVerified = role === 'employer';

  db.insert(usersTable)
    .values({
      id: userId,
      email,
      passwordHash,
      name: name.trim(),
      role,
      title: resolvedTitle,
      avatarInitials: getInitials(name),
      isVerified: initialVerified,
      freelancerProfileId: profileId,
      createdAt: nowIso,
    })
    .run();

  if (role === 'freelancer' && profileId) {
    const rate = dailyRate || 180;
    db.insert(profilesTable)
      .values({
        id: profileId,
        userId,
        fullName: name.trim(),
        age: 35,
        title: resolvedTitle,
        category: resolvedCategory,
        radarCategory: mapProfileToRadarCategory(resolvedCategory),
        bio: `Profissional de ${resolvedCategory} cadastrada na Verilar. Assim que concluir o envio gratuito do documento, selfie e certidão da Polícia Federal, o perfil passará a aparecer nas buscas das famílias.`,
        city: 'São Paulo',
        neighborhood: neighborhood?.trim() || 'Vila Mariana',
        hourlyRate: Math.round(rate / 8),
        dailyRate: rate,
        experienceYears: 3,
        availability: 'online',
        urgencyRadiusKm: 10,
        lat: -23.568 + (Math.random() - 0.5) * 0.03,
        lng: -46.652 + (Math.random() - 0.5) * 0.03,
        responseTimeMinutes: 15,
        phoneMasked: '(11) 98900-****',
        isVerified: false,
        highlightPlan: 'free',
        billingCycle: 'monthly',
        pixKey: `${email}`,
        searchAppearances: 0,
        profileViews: 0,
        chatRequests: 0,
        completedContractsCount: 0,
        publicRating: 5.0,
        publicReviewCount: 0,
        badgesJson: JSON.stringify([]),
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
      ? 'marina@verilar.com.br'
      : 'cida@verilar.com.br';

  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, targetEmail))
    .get();

  if (!userRow) {
    res.status(404).json({ error: 'Usuária de demonstração não encontrada no banco.' });
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
// 3. BOOTSTRAP WORKSPACE DATA
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

  const allChatRows = db.select().from(chatMessagesTable).all();
  const chatMessages = allChatRows
    .filter((m) =>
      isEmployer
        ? m.employerId === authUser.sub
        : m.freelancerId === (authUser.freelancerProfileId || '')
    )
    .map(mapChatRow);

  res.json({
    user: userRow ? mapUserRowToAuthUser(userRow) : null,
    profiles,
    contracts,
    publicReviews,
    secretEvaluations,
    jobAnnouncements,
    appliedJobIds,
    feedPosts,
    chatMessages,
  });
});

// =========================================================================
// 4. PROFILES, VERIFICATION IN LAYERS (LGPD + 90 DAYS), PLANS & RADAR
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
        error: 'Apenas a própria profissional pode alterar sua disponibilidade.',
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

const verifyProfileSchema = z.object({
  documentType: z.string().min(2),
  selfieConfirmed: z.boolean(),
  pfCertificateNumber: z.string().min(4, 'Informe o número da certidão da Polícia Federal.'),
  pfValidationCode: z.string().min(4, 'Informe o código de validação do portal da PF.'),
  courseTitle: z.string().optional(),
  courseInstitution: z.string().optional(),
});

apiRouter.post(
  '/profiles/:id/verify',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const profileId = String(req.params.id);
    const parsed = verifyProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Preencha todos os campos da verificação.',
      });
      return;
    }

    const existing = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, profileId))
      .get();

    if (!existing) {
      res.status(404).json({ error: 'Perfil não encontrado.' });
      return;
    }

    if (
      req.authUser!.role !== 'freelancer' ||
      (req.authUser!.freelancerProfileId !== profileId &&
        req.authUser!.sub !== existing.userId)
    ) {
      res.status(403).json({ error: 'Apenas a titular do perfil pode enviar a verificação.' });
      return;
    }

    if (!parsed.data.selfieConfirmed) {
      res.status(400).json({ error: 'Confirme o envio da selfie com documento oficial.' });
      return;
    }

    const requiresCourse =
      existing.category.toLowerCase().includes('cuidadora') ||
      existing.category.toLowerCase().includes('bab');

    if (requiresCourse && !parsed.data.courseTitle?.trim()) {
      res.status(400).json({
        error: `Para a categoria ${existing.category}, o certificado do curso é obrigatório (Camada 3).`,
      });
      return;
    }

    const today = new Date();
    const verifiedAtStr = today.toLocaleDateString('pt-BR');
    const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expires90Str = in90Days.toLocaleDateString('pt-BR');
    const in2Years = new Date(today.getTime() + 730 * 24 * 60 * 60 * 1000);
    const expiresIdStr = in2Years.toLocaleDateString('pt-BR');

    const newBadges: VerificationBadge[] = [
      {
        id: `bdg-id-${crypto.randomUUID().slice(0, 6)}`,
        type: 'identity',
        layer: 'identidade',
        title: 'Camada 1 · Identidade e Selfie Verificadas',
        issuer: `Moderação Verilar (${parsed.data.documentType} + Selfie)`,
        verifiedAt: verifiedAtStr,
        expiresAt: expiresIdStr,
        status: 'verified',
        documentHash: `PROT-ID-VL-${crypto.randomBytes(3).toString('hex').toUpperCase()} · Resultado: APROVADO`,
        details:
          'Documento oficial com foto comparado com selfie. Pela LGPD, apenas o status aprovado é salvo.',
        lgpdNotice:
          'Pela LGPD, a Verilar armazena apenas o resultado da verificação, descartando as imagens do documento.',
      },
      {
        id: `bdg-pf-${crypto.randomUUID().slice(0, 6)}`,
        type: 'criminal_record',
        layer: 'antecedentes',
        title: 'Camada 2 · Antecedentes Polícia Federal (90 dias)',
        issuer: 'Portal Polícia Federal / gov.br (Conferência de Código)',
        verifiedAt: verifiedAtStr,
        expiresAt: expires90Str,
        validityDays: 90,
        status: 'verified',
        documentHash: `Certidão PF nº ${parsed.data.pfCertificateNumber.trim()} · Cód. ${parsed.data.pfValidationCode.trim().slice(0, 8)}*** (Nada Consta)`,
        details:
          'Autenticidade conferida gratuitamente pelo número e código da PF. Selo válido por 90 dias com renovação periódica.',
        lgpdNotice:
          'Pela LGPD, a certidão não fica salva no servidor; apenas o protocolo e a validade de 90 dias são mantidos.',
      },
    ];

    const currentCerts = JSON.parse(existing.certificationsJson) as FreelancerProfile['certifications'];
    const updatedCerts = [...currentCerts];

    if (parsed.data.courseTitle?.trim()) {
      const inst = parsed.data.courseInstitution?.trim() || 'Instituição Reconhecida';
      newBadges.push({
        id: `bdg-crs-${crypto.randomUUID().slice(0, 6)}`,
        type: 'training_certificate',
        layer: 'formacao',
        title: `Camada 3 · Certificado Conferido (${parsed.data.courseTitle.trim()})`,
        issuer: `${inst} · Conferido pela Moderação Verilar`,
        verifiedAt: verifiedAtStr,
        expiresAt: 'Vitalício',
        status: 'verified',
        documentHash: `PROT-CURSO-${crypto.randomBytes(3).toString('hex').toUpperCase()} · Aprovado`,
        details: 'Certificado de formação profissional conferido pela moderação da Verilar.',
        lgpdNotice: 'Apenas o resultado da conferência do certificado é armazenado (LGPD).',
      });

      if (!updatedCerts.some((c) => c.title === parsed.data.courseTitle!.trim())) {
        updatedCerts.unshift({
          id: `cert-${crypto.randomUUID().slice(0, 6)}`,
          title: parsed.data.courseTitle.trim(),
          institution: inst,
          year: today.getFullYear(),
          certificateUrl: '#',
          verified: true,
        });
      }
    }

    const updatedTitle = existing.title.replace(
      'Aguardando Verificação Gratuita',
      'Perfil Verificado Verilar'
    );

    db.update(profilesTable)
      .set({
        isVerified: true,
        title: updatedTitle,
        badgesJson: JSON.stringify(newBadges),
        certificationsJson: JSON.stringify(updatedCerts),
        searchAppearances: Math.max(existing.searchAppearances, 12),
      })
      .where(eq(profilesTable.id, profileId))
      .run();

    db.update(usersTable)
      .set({
        isVerified: true,
        title: updatedTitle,
      })
      .where(eq(usersTable.id, existing.userId))
      .run();

    const updated = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, profileId))
      .get()!;

    res.json({ profile: mapProfileRow(updated) });
  }
);

const updatePlanSchema = z.object({
  plan: z.enum(['free', 'destaque', 'destaque_pro']),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
});

apiRouter.patch(
  '/profiles/:id/plan',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const profileId = String(req.params.id);
    const parsed = updatePlanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Plano selecionado inválido.' });
      return;
    }

    const existing = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, profileId))
      .get();

    if (!existing) {
      res.status(404).json({ error: 'Perfil não encontrado.' });
      return;
    }

    if (
      req.authUser!.role !== 'freelancer' ||
      (req.authUser!.freelancerProfileId !== profileId &&
        req.authUser!.sub !== existing.userId)
    ) {
      res.status(403).json({
        error: 'Apenas a própria profissional pode gerenciar seu plano opcional.',
      });
      return;
    }

    // Regra do Destaque Justo (Slide 8): só perfis verificados podem comprar destaque
    if (!existing.isVerified && parsed.data.plan !== 'free') {
      res.status(400).json({
        error:
          'Destaque Justo: Apenas perfis já verificados gratuitamente podem assinar o Verilar Destaque. Conclua sua verificação primeiro!',
      });
      return;
    }

    db.update(profilesTable)
      .set({
        highlightPlan: parsed.data.plan,
        billingCycle: parsed.data.billingCycle ?? existing.billingCycle,
      })
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
    .filter((row) => Boolean(row.isVerified))
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
        reviewsCount: row.completedContractsCount,
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
// 5. CHAT & PAYMENT COMBINATION (PIX OR PLATFORM — 0% COMMISSION)
// =========================================================================

const sendChatSchema = z.object({
  freelancerId: z.string().min(1),
  employerId: z.string().optional(),
  content: z.string().min(1, 'Escreva uma mensagem.'),
  proposedAmount: z.number().positive().optional(),
  paymentMethod: z.enum(['pix', 'platform']).optional(),
  serviceDate: z.string().optional(),
});

apiRouter.post(
  '/chats/messages',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const parsed = sendChatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Mensagem inválida.' });
      return;
    }

    const authUser = req.authUser!;
    const profileRow = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, parsed.data.freelancerId))
      .get();

    if (!profileRow) {
      res.status(404).json({ error: 'Profissional destinatária não encontrada.' });
      return;
    }

    let employerId = parsed.data.employerId || '';
    let employerName = 'Família Verilar';

    if (authUser.role === 'employer') {
      employerId = authUser.sub;
      employerName = authUser.name;
    } else {
      const resolvedEmp = employerId
        ? db.select().from(usersTable).where(eq(usersTable.id, employerId)).get()
        : db.select().from(usersTable).where(eq(usersTable.role, 'employer')).get();
      employerId = resolvedEmp?.id || 'emp-501';
      employerName = resolvedEmp?.name || 'Marina Mendes';
    }

    const id = `msg-${crypto.randomUUID().slice(0, 8)}`;
    const nowLabel = `Hoje às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`;

    db.insert(chatMessagesTable)
      .values({
        id,
        employerId,
        employerName,
        freelancerId: profileRow.id,
        freelancerName: profileRow.fullName,
        senderRole: authUser.role,
        senderName: authUser.name,
        content: parsed.data.content.trim(),
        proposedAmount: parsed.data.proposedAmount ?? null,
        paymentMethod: parsed.data.paymentMethod ?? null,
        paymentStatus: parsed.data.proposedAmount ? 'pending' : null,
        serviceDate: parsed.data.serviceDate?.trim() || null,
        createdAt: nowLabel,
      })
      .run();

    if (authUser.role === 'employer') {
      db.update(profilesTable)
        .set({ chatRequests: profileRow.chatRequests + 1 })
        .where(eq(profilesTable.id, profileRow.id))
        .run();
    }

    const created = db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.id, id))
      .get()!;

    res.status(201).json({ message: mapChatRow(created) });
  }
);

apiRouter.patch(
  '/chats/messages/:id/pay',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    const messageId = String(req.params.id);
    const existing = db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.id, messageId))
      .get();

    if (!existing || !existing.proposedAmount) {
      res.status(404).json({ error: 'Proposta de pagamento não encontrada nesta conversa.' });
      return;
    }

    db.update(chatMessagesTable)
      .set({ paymentStatus: 'paid' })
      .where(eq(chatMessagesTable.id, messageId))
      .run();

    // Registra automaticamente o atendimento concluído no histórico para permitir avaliação 1-5 estrelas
    const contractId = `ctr-${crypto.randomUUID().slice(0, 8)}`;
    const profileRow = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, existing.freelancerId))
      .get();

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const methodLabel =
      existing.paymentMethod === 'pix'
        ? 'Pix Direto (0% comissão)'
        : 'Pagamento pela Plataforma Verilar (0% comissão)';

    db.insert(contractsTable)
      .values({
        id: contractId,
        jobId: `chat-${messageId}`,
        jobTitle: `Atendimento Combinado no Chat (${existing.serviceDate || 'Diária'}) — ${methodLabel}`,
        employerId: existing.employerId,
        employerName: existing.employerName,
        freelancerId: existing.freelancerId,
        freelancerName: existing.freelancerName,
        category: profileRow?.category || 'Doméstica / Diarista',
        type: 'diario',
        status: 'completed',
        startDate: dateStr,
        endDate: dateStr,
        agreedRate: existing.proposedAmount,
        rateType: 'daily',
        weeklyHours: 8,
        locationAddress: 'Residência Familiar Verificada · São Paulo/SP',
        clausesJson: JSON.stringify([
          `Cláusula 1ª: Valor de R$ ${existing.proposedAmount.toFixed(2)} quitado via ${methodLabel}.`,
          'Cláusula 2ª: Zero cobrança de comissão sobre o serviço da profissional.',
        ]),
        securityHash: crypto
          .createHash('sha256')
          .update(`${contractId}:${messageId}:${dateStr}`)
          .digest('hex'),
        employerSignedAt: dateStr,
        freelancerSignedAt: dateStr,
        canReview: true,
        createdAt: new Date().toISOString(),
      })
      .run();

    if (profileRow) {
      db.update(profilesTable)
        .set({ completedContractsCount: profileRow.completedContractsCount + 1 })
        .where(eq(profilesTable.id, profileRow.id))
        .run();
    }

    const updatedMsg = db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.id, messageId))
      .get()!;

    const createdContract = db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId))
      .get()!;

    res.json({
      message: mapChatRow(updatedMsg),
      contract: mapContractRow(createdContract),
    });
  }
);

// =========================================================================
// 6. DIGITAL CONTRACTS (PROPOSAL, SIGNATURE, COMPLETION)
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
    res.status(403).json({ error: 'Apenas famílias contratantes podem emitir propostas.' });
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
  const resolvedTitle = jobTitle || `Acordo de Prestação de Serviços — ${role}`;
  const employerId = req.authUser!.sub;
  const employerName = `${req.authUser!.name} (Família Verilar)`;
  const signedTimestamp = `${new Date().toLocaleDateString('pt-BR')} às ${new Date()
    .toLocaleTimeString('pt-BR')
    .slice(0, 5)}`;
  const nowIso = new Date().toISOString();

  const clauses = [
    'Cláusula 1ª: Objeto — Prestação de serviço doméstico ou de cuidado familiar com 0% de comissão descontada da profissional.',
    'Cláusula 2ª: Verificação e LGPD — A profissional possui selo ativo na Verilar, sem retenção de cópias de documentos pessoais.',
    'Cláusula 3ª: Pagamento e Avaliação — Pagamento pela plataforma ou por Pix, com avaliação de 1 a 5 estrelas liberada após o atendimento.',
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
      locationAddress: 'Rua Pelotas, 410 - Vila Mariana, São Paulo/SP',
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
        error: 'Apenas a profissional destinatária deste acordo pode assiná-lo.',
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
        error: 'Apenas a família contratante titular pode encerrar este atendimento.',
      });
      return;
    }

    if (existing.status !== 'active') {
      res.status(400).json({
        error: 'Apenas acordos EM VIGÊNCIA podem ser marcados como concluídos.',
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
// 7. REVIEWS: 1–5 STARS WITH COMMENTS (SLIDE 4) + CONFIDENTIAL EVALUATIONS
// =========================================================================

const createPublicReviewSchema = z.object({
  freelancerId: z.string().min(1),
  contractId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(4, 'Escreva um breve comentário sobre o atendimento.'),
  employerType: z.string().optional(),
});

apiRouter.post(
  '/reviews/public',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    if (req.authUser!.role !== 'employer') {
      res.status(403).json({
        error: 'Apenas famílias clientes podem publicar avaliações de 1 a 5 estrelas.',
      });
      return;
    }

    const parsed = createPublicReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Avaliação inválida.',
      });
      return;
    }

    const profileRow = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, parsed.data.freelancerId))
      .get();

    if (!profileRow) {
      res.status(404).json({ error: 'Perfil da profissional não encontrado.' });
      return;
    }

    // Localiza um atendimento concluído ou cria o registro do atendimento avaliado
    let resolvedContractId = parsed.data.contractId;
    if (!resolvedContractId) {
      const completed = db
        .select()
        .from(contractsTable)
        .where(
          and(
            eq(contractsTable.freelancerId, profileRow.id),
            eq(contractsTable.status, 'completed')
          )
        )
        .get();
      resolvedContractId = completed?.id;
    }

    if (!resolvedContractId) {
      const autoContractId = `ctr-${crypto.randomUUID().slice(0, 8)}`;
      const todayStr = new Date().toLocaleDateString('pt-BR');
      db.insert(contractsTable)
        .values({
          id: autoContractId,
          jobId: `srv-${autoContractId}`,
          jobTitle: `Atendimento ${profileRow.category} Concluído`,
          employerId: req.authUser!.sub,
          employerName: req.authUser!.name,
          freelancerId: profileRow.id,
          freelancerName: profileRow.fullName,
          category: profileRow.category,
          type: 'diario',
          status: 'completed',
          startDate: todayStr,
          endDate: todayStr,
          agreedRate: profileRow.dailyRate,
          rateType: 'daily',
          weeklyHours: 8,
          locationAddress: 'Residência Familiar Verilar · São Paulo/SP',
          clausesJson: JSON.stringify(['Atendimento residencial concluído pela plataforma Verilar.']),
          securityHash: crypto.randomBytes(24).toString('hex'),
          employerSignedAt: todayStr,
          freelancerSignedAt: todayStr,
          canReview: true,
          createdAt: new Date().toISOString(),
        })
        .run();
      resolvedContractId = autoContractId;
    }

    const id = `rev-${crypto.randomUUID().slice(0, 8)}`;
    const todayStr = new Date().toLocaleDateString('pt-BR');

    db.insert(publicReviewsTable)
      .values({
        id,
        contractId: resolvedContractId,
        freelancerId: profileRow.id,
        employerName: req.authUser!.name,
        employerType: parsed.data.employerType?.trim() || 'Família Verilar Verificada',
        rating: parsed.data.rating,
        comment: parsed.data.comment.trim(),
        date: todayStr,
        serviceCategory: profileRow.category,
        contractPeriod: 'Recente',
      })
      .run();

    // Recalcula média de 1 a 5 estrelas
    const allReviewsForProfile = db
      .select({ rating: publicReviewsTable.rating })
      .from(publicReviewsTable)
      .where(eq(publicReviewsTable.freelancerId, profileRow.id))
      .all();

    const total = allReviewsForProfile.length;
    const avg =
      total > 0
        ? Math.round(
            (allReviewsForProfile.reduce((acc, r) => acc + r.rating, 0) / total) * 100
          ) / 100
        : 5.0;

    db.update(profilesTable)
      .set({
        publicRating: avg,
        publicReviewCount: total,
      })
      .where(eq(profilesTable.id, profileRow.id))
      .run();

    const created = db
      .select()
      .from(publicReviewsTable)
      .where(eq(publicReviewsTable.id, id))
      .get()!;

    const updatedProfile = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, profileRow.id))
      .get()!;

    res.status(201).json({
      review: mapPublicReviewRow(created),
      profile: mapProfileRow(updatedProfile),
    });
  }
);

const createSecretReviewSchema = z.object({
  contractId: z.string().min(1),
  freelancerId: z.string().min(1),
  honestyScore: z.number().min(1).max(10),
  punctualityScore: z.number().min(1).max(10),
  discretionConfidentialityScore: z.number().min(1).max(10),
  wouldRehirePrivately: z.boolean(),
  privateNotes: z.string().min(5, 'Descreva o relato com pelo menos 5 caracteres.'),
});

apiRouter.post(
  '/reviews/secret',
  authenticateRequest,
  (req: AuthenticatedRequest, res) => {
    if (req.authUser!.role !== 'employer') {
      res.status(403).json({
        error: 'Acesso negado: Apenas famílias contratantes podem registrar avaliações.',
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
      res.status(404).json({ error: 'Atendimento informado não existe.' });
      return;
    }

    if (
      contractRow.employerId !== req.authUser!.sub ||
      contractRow.freelancerId !== freelancerId
    ) {
      res.status(403).json({
        error: 'Este atendimento não pertence à sua conta com esta profissional.',
      });
      return;
    }

    if (contractRow.status !== 'completed') {
      res.status(400).json({
        error: 'O atendimento precisa estar CONCLUÍDO para liberar avaliação.',
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
          relationshipDuration: `Atendimento concluído (${contractRow.startDate})`,
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
// 8. JOBS & APPLICANT PIPELINE
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
    res.status(403).json({ error: 'Apenas famílias podem publicar anúncios.' });
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
      employerName: `${req.authUser!.name} (Família Verilar)`,
      employerType: 'Família Verificada · Verilar',
      location: `${data.location.trim()} · ${data.distanceKm.toFixed(1)} km de você`,
      distanceKm: data.distanceKm,
      workSchedule: data.workSchedule.trim(),
      contractType: data.contractType,
      rateDescription:
        data.contractType === 'mensal_fixo'
          ? `R$ ${data.rateAmount.toLocaleString('pt-BR')} / mês`
          : `R$ ${data.rateAmount.toLocaleString('pt-BR')} / diária`,
      rateAmount: data.rateAmount,
      postedAt: 'Agora mesmo',
      status: 'active',
      urgency: data.urgency,
      description:
        data.description?.trim() ||
        'Oportunidade para atendimento residencial com selos verificados Verilar.',
      responsibilitiesJson: JSON.stringify([
        'Atendimento zeloso conforme combinado no chat',
        'Pontualidade e comunicação transparente com a família',
      ]),
      requiredBadgesJson: JSON.stringify([
        'Camada 1 · Identidade e Selfie Verificadas',
        'Camada 2 · Antecedentes Polícia Federal (90 dias)',
      ]),
      benefitsJson: JSON.stringify([
        'Zero comissão descontada do pagamento',
        'Pagamento via Pix ou Plataforma Verilar',
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

    if (!profileRow.isVerified) {
      res.status(400).json({
        error:
          'Conclua primeiro sua verificação gratuita (Documento + Selfie + Certidão PF) antes de se candidatar.',
      });
      return;
    }

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
      res.status(403).json({ error: 'Apenas famílias gerenciam as candidaturas.' });
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
// 9. COMMUNITY FEED
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
  const authorRole = userRow?.title ?? 'Membro Verificado Verilar';
  const id = `pst-${crypto.randomUUID().slice(0, 8)}`;

  db.insert(feedPostsTable)
    .values({
      id,
      authorId: req.authUser!.freelancerProfileId || req.authUser!.sub,
      authorName,
      authorRole,
      authorCategory:
        req.authUser!.role === 'freelancer'
          ? 'Profissional Verificada'
          : 'Família Verilar',
      avatarSeed: authorName.toLowerCase(),
      verifiedBadgesCount: 3,
      createdAt: 'Agora mesmo',
      content: parsed.data.content.trim(),
      type: parsed.data.type,
      mediaTitle:
        parsed.data.mediaTitle?.trim() ||
        (parsed.data.type === 'certification'
          ? 'Novo Selo / Curso Conferido pela Moderação Verilar'
          : 'Relato de Atendimento Verificado'),
      mediaSubtext: 'Registro verificado na comunidade Verilar',
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
// 10. RESET DEMO DATABASE
// =========================================================================

apiRouter.post('/demo/reset', authenticateRequest, (req: AuthenticatedRequest, res) => {
  const previousRole = req.authUser!.role;
  resetAndSeedDatabase();

  const targetEmail =
    previousRole === 'employer'
      ? 'marina@verilar.com.br'
      : 'cida@verilar.com.br';

  const userRow = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, targetEmail))
    .get()!;

  const sessionPayload = createSessionAndIssueTokens(req, res, userRow);
  res.json(sessionPayload);
});
