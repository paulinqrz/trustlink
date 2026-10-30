import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'freelancer' | 'employer'
  title: text('title').notNull(),
  avatarInitials: text('avatar_initials').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(true),
  freelancerProfileId: text('freelancer_profile_id'),
  createdAt: text('created_at').notNull(),
});

export const sessionsTable = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  device: text('device').notNull(),
  browser: text('browser').notNull(),
  ip: text('ip').notNull(),
  location: text('location').notNull(),
  lastActive: text('last_active').notNull(),
  expiresAt: integer('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const profilesTable = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  fullName: text('full_name').notNull(),
  age: integer('age').notNull().default(38),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'Doméstica / Diarista' | 'Babá' | 'Cuidadora'
  radarCategory: text('radar_category').notNull(),
  bio: text('bio').notNull(),
  city: text('city').notNull(),
  neighborhood: text('neighborhood').notNull(),
  hourlyRate: real('hourly_rate').notNull(),
  dailyRate: real('daily_rate').notNull(),
  experienceYears: integer('experience_years').notNull(),
  availability: text('availability').notNull(), // 'online' | 'offline' | 'urgency'
  urgencyRadiusKm: real('urgency_radius_km').notNull().default(10),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  responseTimeMinutes: integer('response_time_minutes').notNull().default(20),
  phoneMasked: text('phone_masked').notNull().default('(11) 98800-****'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(true),
  highlightPlan: text('highlight_plan').notNull().default('free'), // 'free' | 'destaque' | 'destaque_pro'
  billingCycle: text('billing_cycle').notNull().default('monthly'), // 'monthly' | 'annual'
  pixKey: text('pix_key').notNull().default('verilar.pagamentos@pix.com.br'),
  searchAppearances: integer('search_appearances').notNull().default(45),
  profileViews: integer('profile_views').notNull().default(19),
  chatRequests: integer('chat_requests').notNull().default(6),
  completedContractsCount: integer('completed_contracts_count').notNull().default(0),
  publicRating: real('public_rating').notNull().default(5.0),
  publicReviewCount: integer('public_review_count').notNull().default(0),
  badgesJson: text('badges_json').notNull(),
  skillsJson: text('skills_json').notNull(),
  certificationsJson: text('certifications_json').notNull(),
});

export const chatMessagesTable = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  employerId: text('employer_id').notNull(),
  employerName: text('employer_name').notNull(),
  freelancerId: text('freelancer_id').notNull(),
  freelancerName: text('freelancer_name').notNull(),
  senderRole: text('sender_role').notNull(), // 'employer' | 'freelancer'
  senderName: text('sender_name').notNull(),
  content: text('content').notNull(),
  proposedAmount: real('proposed_amount'),
  paymentMethod: text('payment_method'), // 'pix' | 'platform'
  paymentStatus: text('payment_status'), // 'pending' | 'paid'
  serviceDate: text('service_date'),
  createdAt: text('created_at').notNull(),
});

export const contractsTable = sqliteTable('contracts', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull(),
  jobTitle: text('job_title').notNull(),
  employerId: text('employer_id').notNull(),
  employerName: text('employer_name').notNull(),
  freelancerId: text('freelancer_id').notNull(),
  freelancerName: text('freelancer_name').notNull(),
  category: text('category').notNull(),
  type: text('type').notNull(), // 'diario' | 'mensal_fixo' | 'plantao_urgencia'
  status: text('status').notNull(), // 'draft' | 'pending_signature' | 'active' | 'completed' | 'cancelled'
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  agreedRate: real('agreed_rate').notNull(),
  rateType: text('rate_type').notNull(), // 'hourly' | 'daily' | 'monthly'
  weeklyHours: integer('weekly_hours'),
  locationAddress: text('location_address').notNull(),
  clausesJson: text('clauses_json').notNull(),
  securityHash: text('security_hash').notNull(),
  employerSignedAt: text('employer_signed_at'),
  freelancerSignedAt: text('freelancer_signed_at'),
  canReview: integer('can_review', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const publicReviewsTable = sqliteTable('public_reviews', {
  id: text('id').primaryKey(),
  contractId: text('contract_id')
    .notNull()
    .references(() => contractsTable.id, { onDelete: 'restrict' }),
  freelancerId: text('freelancer_id').notNull(),
  employerName: text('employer_name').notNull(),
  employerType: text('employer_type').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  date: text('date').notNull(),
  serviceCategory: text('service_category').notNull(),
  contractPeriod: text('contract_period').notNull(),
});

export const secretEvaluationsTable = sqliteTable('secret_evaluations', {
  id: text('id').primaryKey(),
  contractId: text('contract_id')
    .notNull()
    .references(() => contractsTable.id, { onDelete: 'restrict' }),
  employerId: text('employer_id').notNull(),
  freelancerId: text('freelancer_id').notNull(),
  evaluatedAt: text('evaluated_at').notNull(),
  relationshipDuration: text('relationship_duration').notNull(),
  honestyScore: real('honesty_score').notNull(),
  punctualityScore: real('punctuality_score').notNull(),
  emotionalStabilityScore: real('emotional_stability_score').notNull(),
  discretionConfidentialityScore: real('discretion_confidentiality_score').notNull(),
  reactionUnderCrisisScore: real('reaction_under_crisis_score').notNull(),
  wouldRehirePrivately: integer('would_rehire_privately', { mode: 'boolean' }).notNull(),
  privateNotes: text('private_notes').notNull(),
  hasVerifiedContract: integer('has_verified_contract', { mode: 'boolean' }).notNull().default(true),
});

export const jobAnnouncementsTable = sqliteTable('job_announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  employerId: text('employer_id').notNull(),
  employerName: text('employer_name').notNull(),
  employerType: text('employer_type').notNull(),
  location: text('location').notNull(),
  distanceKm: real('distance_km').notNull(),
  workSchedule: text('work_schedule').notNull(),
  contractType: text('contract_type').notNull(),
  rateDescription: text('rate_description').notNull(),
  rateAmount: real('rate_amount').notNull(),
  postedAt: text('posted_at').notNull(),
  status: text('status').notNull(),
  urgency: integer('urgency', { mode: 'boolean' }).notNull().default(false),
  description: text('description').notNull(),
  responsibilitiesJson: text('responsibilities_json').notNull(),
  requiredBadgesJson: text('required_badges_json').notNull(),
  benefitsJson: text('benefits_json').notNull(),
  createdAt: text('created_at').notNull(),
});

export const jobApplicantsTable = sqliteTable('job_applicants', {
  id: text('id').primaryKey(),
  announcementId: text('announcement_id')
    .notNull()
    .references(() => jobAnnouncementsTable.id, { onDelete: 'cascade' }),
  candidateId: text('candidate_id').notNull(),
  candidateName: text('candidate_name').notNull(),
  candidateRole: text('candidate_role').notNull(),
  avatarSeed: text('avatar_seed'),
  rating: real('rating').notNull(),
  reviewCount: integer('review_count').notNull(),
  distanceKm: real('distance_km').notNull(),
  salaryExpectation: real('salary_expectation').notNull(),
  stage: text('stage').notNull(), // 'triagem' | 'entrevista' | 'proposta' | 'contratado'
  appliedDate: text('applied_date').notNull(),
  badgesJson: text('badges_json').notNull(),
  coverNote: text('cover_note').notNull(),
  contractId: text('contract_id'),
  confidentialFeedbackSnippet: text('confidential_feedback_snippet'),
});

export const feedPostsTable = sqliteTable('feed_posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  authorCategory: text('author_category').notNull(),
  avatarSeed: text('avatar_seed').notNull(),
  verifiedBadgesCount: integer('verified_badges_count').notNull().default(3),
  createdAt: text('created_at').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // 'certification' | 'daily_routine' | 'milestone'
  mediaTitle: text('media_title'),
  mediaSubtext: text('media_subtext'),
  likesCount: integer('likes_count').notNull().default(1),
  endorsementsCount: integer('endorsements_count').notNull().default(0),
  hasVerifiedExEmployerEndorsement: integer('has_verified_ex_employer_endorsement', {
    mode: 'boolean',
  })
    .notNull()
    .default(false),
  endorsedByEmployer: text('endorsed_by_employer'),
});
