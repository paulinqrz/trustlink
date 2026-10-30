export type AvailabilityStatus = 'online' | 'offline' | 'urgency';

export interface VerificationBadge {
  id: string;
  type: 'criminal_record' | 'facial_biometrics' | 'cnh' | 'nursing_council';
  title: string;
  issuer: string;
  verifiedAt: string;
  expiresAt: string;
  status: 'verified' | 'pending' | 'expired';
  documentHash: string;
  details: string;
}

export interface SkillEndorsement {
  id: string;
  skill: string;
  verifiedCount: number;
  validations: {
    employerName: string;
    employerRole: string;
    contractTitle: string;
    date: string;
    verifiedContractId: string;
  }[];
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  category:
    | 'Cuidadora de Idosos'
    | 'Técnica de Enfermagem'
    | 'Babá / Cuidadora Infantil'
    | 'Governanta Doméstica'
    | 'Pet Sitter Especializado'
    | string;
  bio: string;
  city: string;
  neighborhood: string;
  hourlyRate: number;
  dailyRate: number;
  experienceYears: number;
  availability: AvailabilityStatus;
  urgencyRadiusKm: number;
  lat: number;
  lng: number;
  completedContractsCount: number;
  publicRating: number;
  publicReviewCount: number;
  badges: VerificationBadge[];
  skills: SkillEndorsement[];
  certifications: {
    id: string;
    title: string;
    institution: string;
    year: number;
    certificateUrl: string;
    verified: boolean;
  }[];
}

export interface RadarFreelancer {
  id: string;
  name: string;
  role: string;
  category: string;
  lat: number;
  lng: number;
  distanceKm: number;
  urgencyStatus: AvailabilityStatus;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  dailyRate: number;
  responseTimeMinutes: number;
  badges: string[];
  phoneMasked: string;
}

export interface PublicReview {
  id: string;
  contractId: string;
  freelancerId: string;
  employerName: string;
  employerType: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  serviceCategory: string;
  contractPeriod: string;
}

export interface SecretEvaluation {
  id: string;
  contractId: string;
  freelancerId: string;
  evaluatedAt: string;
  relationshipDuration: string;
  honestyScore: number; // 1-10
  punctualityScore: number; // 1-10
  emotionalStabilityScore: number; // 1-10
  discretionConfidentialityScore: number; // 1-10
  reactionUnderCrisisScore: number; // 1-10
  wouldRehirePrivately: boolean;
  privateNotes: string; // Visível apenas para empregadores verificados
  hasVerifiedContract: boolean;
}

export interface Contract {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  freelancerId: string;
  freelancerName: string;
  category: string;
  type: 'diario' | 'mensal_fixo' | 'plantao_urgencia';
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  agreedRate: number;
  rateType: 'hourly' | 'daily' | 'monthly';
  weeklyHours?: number;
  locationAddress: string;
  clauses: string[];
  securityHash: string;
  employerSignedAt?: string;
  freelancerSignedAt?: string;
  canReview: boolean;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorCategory: string;
  avatarSeed: string;
  verifiedBadgesCount: number;
  createdAt: string;
  content: string;
  type: 'certification' | 'daily_routine' | 'milestone';
  mediaTitle?: string;
  mediaSubtext?: string;
  likesCount: number;
  endorsementsCount: number;
  hasVerifiedExEmployerEndorsement: boolean;
  endorsedByEmployer?: string;
}

export interface JobApplicant {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  avatarSeed?: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  salaryExpectation: number;
  stage: 'triagem' | 'entrevista' | 'proposta' | 'contratado';
  appliedDate: string;
  badges: string[];
  coverNote: string;
  contractId?: string;
  confidentialFeedbackSnippet?: string;
}

export interface JobAnnouncement {
  id: string;
  title: string;
  employerId: string;
  employerName: string;
  employerType: string;
  location: string;
  distanceKm: number;
  workSchedule: string;
  contractType: 'diario' | 'mensal_fixo' | 'plantao_urgencia';
  rateDescription: string;
  rateAmount: number;
  postedAt: string;
  status: 'active' | 'paused' | 'closed';
  urgency: boolean;
  description: string;
  responsibilities: string[];
  requiredBadges: string[];
  benefits: string[];
  applicants: JobApplicant[];
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  expiresInMinutes: number;
}

export interface AuthUser {
  id: string;
  freelancerProfileId?: string;
  name: string;
  email: string;
  role: 'freelancer' | 'employer';
  title: string;
  avatarInitials: string;
  isVerified: boolean;
  activeContractsCount: number;
}
