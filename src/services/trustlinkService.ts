import {
  AuthUser,
  AvailabilityStatus,
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
} from '../types';

const TOKEN_STORAGE_KEY = 'verilar_access_token_v1';

export interface BootstrapPayload {
  user: AuthUser | null;
  profiles: FreelancerProfile[];
  contracts: Contract[];
  publicReviews: PublicReview[];
  secretEvaluations: SecretEvaluation[];
  jobAnnouncements: JobAnnouncement[];
  appliedJobIds: string[];
  feedPosts: FeedPost[];
  chatMessages: ChatMessage[];
}

let inMemoryAccessToken: string | null = null;

function getStoredToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  try {
    return (
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      sessionStorage.getItem(TOKEN_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

function persistToken(token: string | null, remember = true): void {
  inMemoryAccessToken = token;
  try {
    if (!token) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }
    if (remember) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
}

async function tryRefreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      persistToken(null);
      return null;
    }
    const data = (await res.json()) as { accessToken: string };
    persistToken(data.accessToken, true);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && allowRefresh) {
    const refreshedToken = await tryRefreshAccessToken();
    if (refreshedToken) {
      return apiFetch<T>(path, options, false);
    }
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errMsg =
      (json as { error?: string }).error ||
      `Erro na comunicação com o servidor (${response.status}).`;
    throw new Error(errMsg);
  }

  return json as T;
}

export { getInitials } from '../lib/utils';

export const DEMO_PREVIEW_CARDS = {
  freelancer: {
    name: 'Cida Oliveira, 47 anos',
    title: 'Diarista e Doméstica há 15 anos · Selo PF 90 dias',
    email: 'cida@verilar.com.br',
  },
  employer: {
    name: 'Marina Mendes, 38 anos',
    title: 'Mãe de duas crianças · Trabalha fora o dia todo',
    email: 'marina@verilar.com.br',
  },
} as const;

export const trustlinkService = {
  async loginWithPassword(
    email: string,
    password: string,
    rememberMe = true
  ): Promise<AuthUser> {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );
    persistToken(res.accessToken, rememberMe);
    return res.user;
  },

  async registerAccount(payload: {
    name: string;
    email: string;
    password: string;
    role: 'freelancer' | 'employer';
    category?: string;
    dailyRate?: number;
    neighborhood?: string;
  }): Promise<AuthUser> {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );
    persistToken(res.accessToken, true);
    return res.user;
  },

  async demoLogin(role: 'freelancer' | 'employer'): Promise<AuthUser> {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      '/auth/demo-login',
      {
        method: 'POST',
        body: JSON.stringify({ role }),
      },
      false
    );
    persistToken(res.accessToken, true);
    return res.user;
  },

  async restoreSession(): Promise<AuthUser | null> {
    const token = getStoredToken();
    if (token) {
      try {
        const res = await apiFetch<{ user: AuthUser }>('/auth/me');
        return res.user;
      } catch {
        // Fallback to refresh
      }
    }
    const refreshed = await tryRefreshAccessToken();
    if (!refreshed) return null;
    try {
      const res = await apiFetch<{ user: AuthUser }>('/auth/me', {}, false);
      return res.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }, false);
    } catch {
      // Ignore network errors on logout
    } finally {
      persistToken(null);
    }
  },

  async fetchBootstrap(): Promise<BootstrapPayload> {
    return apiFetch<BootstrapPayload>('/bootstrap');
  },

  async fetchNearbyRadar(params: {
    lat?: number;
    lng?: number;
    radiusKm: number;
    category: string;
    urgencyOnly: boolean;
  }): Promise<RadarFreelancer[]> {
    const search = new URLSearchParams({
      radiusKm: String(params.radiusKm),
      category: params.category,
      urgencyOnly: String(params.urgencyOnly),
    });
    if (params.lat !== undefined) search.set('lat', String(params.lat));
    if (params.lng !== undefined) search.set('lng', String(params.lng));

    const res = await apiFetch<{ freelancers: RadarFreelancer[] }>(
      `/radar/nearby?${search.toString()}`
    );
    return res.freelancers;
  },

  async updateAvailability(
    profileId: string,
    status: AvailabilityStatus
  ): Promise<FreelancerProfile> {
    const res = await apiFetch<{ profile: FreelancerProfile }>(
      `/profiles/${encodeURIComponent(profileId)}/availability`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return res.profile;
  },

  async verifyProfileInLayers(
    profileId: string,
    payload: {
      documentType: string;
      selfieConfirmed: boolean;
      pfCertificateNumber: string;
      pfValidationCode: string;
      courseTitle?: string;
      courseInstitution?: string;
    }
  ): Promise<FreelancerProfile> {
    const res = await apiFetch<{ profile: FreelancerProfile }>(
      `/profiles/${encodeURIComponent(profileId)}/verify`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.profile;
  },

  async updateHighlightPlan(
    profileId: string,
    plan: HighlightPlan,
    billingCycle: BillingCycle
  ): Promise<FreelancerProfile> {
    const res = await apiFetch<{ profile: FreelancerProfile }>(
      `/profiles/${encodeURIComponent(profileId)}/plan`,
      {
        method: 'PATCH',
        body: JSON.stringify({ plan, billingCycle }),
      }
    );
    return res.profile;
  },

  async sendChatMessage(payload: {
    freelancerId: string;
    employerId?: string;
    content: string;
    proposedAmount?: number;
    paymentMethod?: 'pix' | 'platform';
    serviceDate?: string;
  }): Promise<ChatMessage> {
    const res = await apiFetch<{ message: ChatMessage }>('/chats/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.message;
  },

  async confirmChatPayment(
    messageId: string
  ): Promise<{ message: ChatMessage; contract: Contract }> {
    return apiFetch<{ message: ChatMessage; contract: Contract }>(
      `/chats/messages/${encodeURIComponent(messageId)}/pay`,
      { method: 'PATCH' }
    );
  },

  async createPublicReview(payload: {
    freelancerId: string;
    contractId?: string;
    rating: number;
    comment: string;
    employerType?: string;
  }): Promise<{ review: PublicReview; profile: FreelancerProfile }> {
    return apiFetch<{ review: PublicReview; profile: FreelancerProfile }>(
      '/reviews/public',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async createProposalContract(payload: {
    freelancerId: string;
    candidateName: string;
    role: string;
    rate: number;
    jobId?: string;
    jobTitle?: string;
  }): Promise<Contract> {
    const res = await apiFetch<{ contract: Contract }>('/contracts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.contract;
  },

  async signContract(contractId: string): Promise<Contract> {
    const res = await apiFetch<{ contract: Contract }>(
      `/contracts/${encodeURIComponent(contractId)}/sign`,
      { method: 'PATCH' }
    );
    return res.contract;
  },

  async completeContract(contractId: string): Promise<Contract> {
    const res = await apiFetch<{ contract: Contract }>(
      `/contracts/${encodeURIComponent(contractId)}/complete`,
      { method: 'PATCH' }
    );
    return res.contract;
  },

  async createSecretEvaluation(payload: {
    contractId: string;
    freelancerId: string;
    honestyScore: number;
    punctualityScore: number;
    discretionConfidentialityScore: number;
    wouldRehirePrivately: boolean;
    privateNotes: string;
  }): Promise<SecretEvaluation> {
    const res = await apiFetch<{ evaluation: SecretEvaluation }>(
      '/reviews/secret',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.evaluation;
  },

  async createJobAnnouncement(payload: {
    title: string;
    location: string;
    distanceKm: number;
    workSchedule: string;
    contractType: JobAnnouncement['contractType'];
    rateAmount: number;
    urgency: boolean;
    description?: string;
  }): Promise<JobAnnouncement> {
    const res = await apiFetch<{ announcement: JobAnnouncement }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.announcement;
  },

  async applyToJob(jobId: string, note: string): Promise<JobAnnouncement> {
    const res = await apiFetch<{ announcement: JobAnnouncement }>(
      `/jobs/${encodeURIComponent(jobId)}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ note }),
      }
    );
    return res.announcement;
  },

  async updateApplicantStage(
    announcementId: string,
    applicantId: string,
    stage: JobApplicant['stage'],
    contractId?: string
  ): Promise<JobAnnouncement> {
    const res = await apiFetch<{ announcement: JobAnnouncement }>(
      `/jobs/${encodeURIComponent(announcementId)}/applicants/${encodeURIComponent(
        applicantId
      )}/stage`,
      {
        method: 'PATCH',
        body: JSON.stringify({ stage, contractId }),
      }
    );
    return res.announcement;
  },

  async createFeedPost(payload: {
    content: string;
    type: FeedPost['type'];
    mediaTitle?: string;
  }): Promise<FeedPost> {
    const res = await apiFetch<{ post: FeedPost }>('/feed', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.post;
  },

  async likeFeedPost(postId: string): Promise<FeedPost> {
    const res = await apiFetch<{ post: FeedPost }>(
      `/feed/${encodeURIComponent(postId)}/like`,
      { method: 'POST' }
    );
    return res.post;
  },

  async resetDemoDatabase(): Promise<AuthUser> {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      '/demo/reset',
      { method: 'POST' }
    );
    persistToken(res.accessToken, true);
    return res.user;
  },
};
