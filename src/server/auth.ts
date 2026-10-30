import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.ts';
import { contractsTable, sessionsTable } from '../db/schema.ts';
import type { usersTable } from '../db/schema.ts';
import type { AuthUser } from '../types/index.ts';

const JWT_SECRET =
  process.env.JWT_SECRET || 'trustlink-local-dev-secret-change-in-production';

export const REFRESH_COOKIE_NAME = 'trustlink_refresh';
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export interface JwtClaims {
  sub: string;
  role: 'freelancer' | 'employer';
  name: string;
  email: string;
  sessionId: string;
  freelancerProfileId?: string;
}

export interface AuthenticatedRequest extends Request {
  authUser?: JwtClaims;
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function signAccessToken(claims: JwtClaims): string {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: '2h' });
}

export function verifyAccessToken(token: string): JwtClaims | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtClaims;
  } catch {
    return null;
  }
}

function getCookieOptions(req: Request) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    path: '/api/v1',
    maxAge: REFRESH_TTL_MS,
  };
}

function parseUserAgent(uaRaw: string | undefined): { device: string; browser: string } {
  const ua = uaRaw || 'Navegador Local';
  const device = ua.includes('Mac')
    ? 'macOS Desktop'
    : ua.includes('Win')
    ? 'Windows PC'
    : ua.includes('Linux')
    ? 'Linux Workstation'
    : ua.includes('iPhone') || ua.includes('Android')
    ? 'Dispositivo Mobile'
    : 'Estação Web';

  const browser = ua.includes('Edg')
    ? 'Microsoft Edge'
    : ua.includes('Chrome')
    ? 'Google Chrome'
    : ua.includes('Firefox')
    ? 'Mozilla Firefox'
    : ua.includes('Safari')
    ? 'Apple Safari'
    : 'Browser Padrão';

  return { device, browser };
}

type UserRow = typeof usersTable.$inferSelect;

export function mapUserRowToAuthUser(row: UserRow): AuthUser {
  const contracts = db
    .select({ status: contractsTable.status })
    .from(contractsTable)
    .where(
      row.role === 'employer'
        ? eq(contractsTable.employerId, row.id)
        : eq(contractsTable.freelancerId, row.freelancerProfileId || row.id)
    )
    .all();

  const activeContractsCount = contracts.filter(
    (c) => c.status === 'active' || c.status === 'pending_signature'
  ).length;

  return {
    id: row.id,
    freelancerProfileId: row.freelancerProfileId ?? undefined,
    name: row.name,
    email: row.email,
    role: row.role as 'freelancer' | 'employer',
    title: row.title,
    avatarInitials: row.avatarInitials,
    isVerified: Boolean(row.isVerified),
    activeContractsCount,
  };
}

export function createSessionAndIssueTokens(
  req: Request,
  res: Response,
  userRow: UserRow
): { accessToken: string; user: AuthUser } {
  const sessionId = `sess-${crypto.randomUUID().slice(0, 8)}`;
  const rawRefresh = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = hashToken(rawRefresh);
  const { device, browser } = parseUserAgent(req.headers['user-agent']);
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const nowIso = new Date().toISOString();

  db.insert(sessionsTable)
    .values({
      id: sessionId,
      userId: userRow.id,
      refreshTokenHash,
      device,
      browser,
      ip,
      location: 'Brasil (Conexão Verificada)',
      lastActive: 'Agora mesmo',
      expiresAt: Date.now() + REFRESH_TTL_MS,
      createdAt: nowIso,
    })
    .run();

  res.cookie(
    REFRESH_COOKIE_NAME,
    `${sessionId}:${rawRefresh}`,
    getCookieOptions(req)
  );

  const accessToken = signAccessToken({
    sub: userRow.id,
    role: userRow.role as 'freelancer' | 'employer',
    name: userRow.name,
    email: userRow.email,
    sessionId,
    freelancerProfileId: userRow.freelancerProfileId ?? undefined,
  });

  return {
    accessToken,
    user: mapUserRowToAuthUser(userRow),
  };
}

export function clearRefreshCookie(req: Request, res: Response): void {
  const opts = getCookieOptions(req);
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
  });
}

export function authenticateRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação ausente.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  const claims = verifyAccessToken(token);
  if (!claims) {
    res.status(401).json({ error: 'Token expirado ou inválido.' });
    return;
  }

  req.authUser = claims;
  next();
}
