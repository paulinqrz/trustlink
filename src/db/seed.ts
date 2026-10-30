import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { count } from 'drizzle-orm';
import { db, sqlite } from './index.ts';
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
} from './schema.ts';
import { getInitials } from '../lib/utils.ts';
import {
  sampleActiveSessions,
  sampleCaregiverProfiles,
  sampleContracts,
  sampleFeedPosts,
  sampleJobAnnouncements,
  samplePublicReviews,
  sampleRadarFreelancers,
  sampleSecretEvaluations,
  testUsers,
} from './seedData.ts';

export const DEMO_PASSWORD_PLAIN = 'trustlink123';

function mapProfileToRadarCategory(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('idoso') || lower.includes('geriátr')) return 'Cuidado de Idosos';
  if (lower.includes('enferm')) return 'Enfermagem & Acompanhamento';
  if (lower.includes('babá') || lower.includes('infantil')) return 'Cuidado Infantil';
  if (lower.includes('governan') || lower.includes('doméstic')) {
    return 'Serviços Domésticos de Confiança';
  }
  if (lower.includes('pet') || lower.includes('veterin')) return 'Pet Care de Alta Confiança';
  return 'Cuidado de Idosos';
}

export function seedDatabase(): void {
  const nowIso = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD_PLAIN, 10);

  const runSeedTx = sqlite.transaction(() => {
    // 1. Seed primary employer + primary freelancer + all other caregiver accounts
    db.insert(usersTable)
      .values({
        id: testUsers.employer.id,
        email: testUsers.employer.email.toLowerCase(),
        passwordHash,
        name: testUsers.employer.name,
        role: 'employer',
        title: testUsers.employer.title,
        avatarInitials: testUsers.employer.avatarInitials,
        isVerified: true,
        freelancerProfileId: null,
        createdAt: nowIso,
      })
      .run();

    db.insert(usersTable)
      .values({
        id: testUsers.freelancer.id,
        email: testUsers.freelancer.email.toLowerCase(),
        passwordHash,
        name: testUsers.freelancer.name,
        role: 'freelancer',
        title: testUsers.freelancer.title,
        avatarInitials: testUsers.freelancer.avatarInitials,
        isVerified: true,
        freelancerProfileId: testUsers.freelancer.freelancerProfileId ?? 'fl-101',
        createdAt: nowIso,
      })
      .run();

    for (const profile of sampleCaregiverProfiles) {
      if (profile.userId === testUsers.freelancer.id) continue;
      const slug = profile.fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.|\.$|/g, '');
      db.insert(usersTable)
        .values({
          id: profile.userId,
          email: `${slug}@trustlink.org`,
          passwordHash,
          name: profile.fullName,
          role: 'freelancer',
          title: profile.title,
          avatarInitials: getInitials(profile.fullName),
          isVerified: true,
          freelancerProfileId: profile.id,
          createdAt: nowIso,
        })
        .run();
    }

    // 2. Seed profiles (enriched with radar metadata from sampleRadarFreelancers)
    for (const profile of sampleCaregiverProfiles) {
      const radarMatch = sampleRadarFreelancers.find((r) => r.id === profile.id);
      db.insert(profilesTable)
        .values({
          id: profile.id,
          userId: profile.userId,
          fullName: profile.fullName,
          title: profile.title,
          category: profile.category,
          radarCategory: radarMatch?.category ?? mapProfileToRadarCategory(profile.category),
          bio: profile.bio,
          city: profile.city,
          neighborhood: profile.neighborhood,
          hourlyRate: profile.hourlyRate,
          dailyRate: profile.dailyRate,
          experienceYears: profile.experienceYears,
          availability: profile.availability,
          urgencyRadiusKm: profile.urgencyRadiusKm,
          lat: radarMatch?.lat ?? profile.lat,
          lng: radarMatch?.lng ?? profile.lng,
          responseTimeMinutes: radarMatch?.responseTimeMinutes ?? 20,
          phoneMasked: radarMatch?.phoneMasked ?? '(11) 98700-****',
          completedContractsCount: profile.completedContractsCount,
          publicRating: profile.publicRating,
          publicReviewCount: profile.publicReviewCount,
          badgesJson: JSON.stringify(profile.badges),
          skillsJson: JSON.stringify(profile.skills),
          certificationsJson: JSON.stringify(profile.certifications),
        })
        .run();
    }

    // 3. Seed contracts (including historical completed contracts referenced by reviews/secret evals)
    const seededContractIds = new Set<string>();
    for (const contract of sampleContracts) {
      seededContractIds.add(contract.id);
      db.insert(contractsTable)
        .values({
          id: contract.id,
          jobId: contract.jobId,
          jobTitle: contract.jobTitle,
          employerId: contract.employerId,
          employerName: contract.employerName,
          freelancerId: contract.freelancerId,
          freelancerName: contract.freelancerName,
          category: contract.category,
          type: contract.type,
          status: contract.status,
          startDate: contract.startDate,
          endDate: contract.endDate ?? null,
          agreedRate: contract.agreedRate,
          rateType: contract.rateType,
          weeklyHours: contract.weeklyHours ?? null,
          locationAddress: contract.locationAddress,
          clausesJson: JSON.stringify(contract.clauses),
          securityHash: contract.securityHash,
          employerSignedAt: contract.employerSignedAt ?? null,
          freelancerSignedAt: contract.freelancerSignedAt ?? null,
          canReview: contract.canReview,
          createdAt: nowIso,
        })
        .run();
    }

    // Ensure every historical contract referenced in samplePublicReviews or sampleSecretEvaluations exists as 'completed'
    const allReferencedReviews = [
      ...samplePublicReviews.map((r) => ({
        contractId: r.contractId,
        freelancerId: r.freelancerId,
        employerName: r.employerName,
        category: r.serviceCategory,
        date: r.date,
      })),
      ...sampleSecretEvaluations.map((s) => ({
        contractId: s.contractId,
        freelancerId: s.freelancerId,
        employerName: 'Família Contratante Auditada',
        category: 'Atendimento Residencial Verificado',
        date: s.evaluatedAt,
      })),
    ];

    for (const ref of allReferencedReviews) {
      if (seededContractIds.has(ref.contractId)) continue;
      seededContractIds.add(ref.contractId);

      const matchedProfile = sampleCaregiverProfiles.find((p) => p.id === ref.freelancerId);
      const hash = crypto
        .createHash('sha256')
        .update(`${ref.contractId}:${ref.freelancerId}:${ref.date}`)
        .digest('hex');

      db.insert(contractsTable)
        .values({
          id: ref.contractId,
          jobId: `job-${ref.contractId}`,
          jobTitle: `${ref.category} (Histórico Auditado)`,
          employerId:
            ref.employerName.includes('Beatriz') ? testUsers.employer.id : 'emp-hist-audit',
          employerName: ref.employerName,
          freelancerId: ref.freelancerId,
          freelancerName: matchedProfile?.fullName ?? 'Profissional Auditado(a)',
          category: matchedProfile?.category ?? ref.category,
          type: 'diario',
          status: 'completed',
          startDate: '01/02/2026',
          endDate: ref.date,
          agreedRate: matchedProfile?.dailyRate ?? 340,
          rateType: 'daily',
          weeklyHours: 40,
          locationAddress: 'Residência Verificada · São Paulo/SP',
          clausesJson: JSON.stringify([
            'Cláusula 1ª: Prestação de serviços concluída integralmente e auditada na plataforma.',
            'Cláusula 2ª: Sigilo residencial e familiar sob protocolo LGPD.',
          ]),
          securityHash: hash,
          employerSignedAt: '01/02/2026 09:00',
          freelancerSignedAt: '01/02/2026 09:15',
          canReview: true,
          createdAt: nowIso,
        })
        .run();
    }

    // 4. Seed public reviews (validated by SQLite trigger trg_public_review_requires_completed_contract)
    for (const review of samplePublicReviews) {
      db.insert(publicReviewsTable)
        .values({
          id: review.id,
          contractId: review.contractId,
          freelancerId: review.freelancerId,
          employerName: review.employerName,
          employerType: review.employerType,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          serviceCategory: review.serviceCategory,
          contractPeriod: review.contractPeriod,
        })
        .run();
    }

    // 5. Seed secret evaluations (validated by SQLite trigger trg_secret_eval_requires_completed_contract)
    for (const secret of sampleSecretEvaluations) {
      db.insert(secretEvaluationsTable)
        .values({
          id: secret.id,
          contractId: secret.contractId,
          employerId: testUsers.employer.id,
          freelancerId: secret.freelancerId,
          evaluatedAt: secret.evaluatedAt,
          relationshipDuration: secret.relationshipDuration,
          honestyScore: secret.honestyScore,
          punctualityScore: secret.punctualityScore,
          emotionalStabilityScore: secret.emotionalStabilityScore,
          discretionConfidentialityScore: secret.discretionConfidentialityScore,
          reactionUnderCrisisScore: secret.reactionUnderCrisisScore,
          wouldRehirePrivately: secret.wouldRehirePrivately,
          privateNotes: secret.privateNotes,
          hasVerifiedContract: secret.hasVerifiedContract,
        })
        .run();
    }

    // 6. Seed job announcements + applicants
    for (const job of sampleJobAnnouncements) {
      db.insert(jobAnnouncementsTable)
        .values({
          id: job.id,
          title: job.title,
          employerId: job.employerId,
          employerName: job.employerName,
          employerType: job.employerType,
          location: job.location,
          distanceKm: job.distanceKm,
          workSchedule: job.workSchedule,
          contractType: job.contractType,
          rateDescription: job.rateDescription,
          rateAmount: job.rateAmount,
          postedAt: job.postedAt,
          status: job.status,
          urgency: job.urgency,
          description: job.description,
          responsibilitiesJson: JSON.stringify(job.responsibilities),
          requiredBadgesJson: JSON.stringify(job.requiredBadges),
          benefitsJson: JSON.stringify(job.benefits),
          createdAt: nowIso,
        })
        .run();

      for (const applicant of job.applicants) {
        db.insert(jobApplicantsTable)
          .values({
            id: applicant.id,
            announcementId: job.id,
            candidateId: applicant.candidateId,
            candidateName: applicant.candidateName,
            candidateRole: applicant.candidateRole,
            avatarSeed: applicant.avatarSeed ?? null,
            rating: applicant.rating,
            reviewCount: applicant.reviewCount,
            distanceKm: applicant.distanceKm,
            salaryExpectation: applicant.salaryExpectation,
            stage: applicant.stage,
            appliedDate: applicant.appliedDate,
            badgesJson: JSON.stringify(applicant.badges),
            coverNote: applicant.coverNote,
            contractId: applicant.contractId ?? null,
            confidentialFeedbackSnippet: applicant.confidentialFeedbackSnippet ?? null,
          })
          .run();
      }
    }

    // 7. Seed feed posts
    for (const post of sampleFeedPosts) {
      db.insert(feedPostsTable)
        .values({
          id: post.id,
          authorId: post.authorId,
          authorName: post.authorName,
          authorRole: post.authorRole,
          authorCategory: post.authorCategory,
          avatarSeed: post.avatarSeed,
          verifiedBadgesCount: post.verifiedBadgesCount,
          createdAt: post.createdAt,
          content: post.content,
          type: post.type,
          mediaTitle: post.mediaTitle ?? null,
          mediaSubtext: post.mediaSubtext ?? null,
          likesCount: post.likesCount,
          endorsementsCount: post.endorsementsCount,
          hasVerifiedExEmployerEndorsement: post.hasVerifiedExEmployerEndorsement,
          endorsedByEmployer: post.endorsedByEmployer ?? null,
        })
        .run();
    }

    // 8. Seed initial device sessions for demonstration of session revocation
    for (const sess of sampleActiveSessions) {
      if (sess.isCurrent) continue;
      db.insert(sessionsTable)
        .values({
          id: sess.id,
          userId: testUsers.freelancer.id,
          refreshTokenHash: crypto.randomBytes(24).toString('hex'),
          device: sess.device,
          browser: sess.browser,
          ip: sess.ip,
          location: sess.location,
          lastActive: sess.lastActive,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          createdAt: nowIso,
        })
        .run();
    }
  });

  runSeedTx();
}

export function seedDatabaseIfEmpty(): void {
  const existing = db.select({ total: count() }).from(usersTable).get();
  if (!existing || existing.total === 0) {
    seedDatabase();
  }
}

export function resetAndSeedDatabase(): void {
  const resetTx = sqlite.transaction(() => {
    db.delete(publicReviewsTable).run();
    db.delete(secretEvaluationsTable).run();
    db.delete(jobApplicantsTable).run();
    db.delete(jobAnnouncementsTable).run();
    db.delete(feedPostsTable).run();
    db.delete(contractsTable).run();
    db.delete(profilesTable).run();
    db.delete(sessionsTable).run();
    db.delete(usersTable).run();
  });
  resetTx();
  seedDatabase();
}
