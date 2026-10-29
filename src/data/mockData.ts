import { 
  FreelancerProfile, 
  PublicReview, 
  SecretEvaluation, 
  Contract, 
  FeedPost, 
  JobPipelineItem,
  JobApplicant,
  JobAnnouncement,
  ActiveSession,
  AuthUser
} from '../types';

export const testUsers: Record<'freelancer' | 'employer', AuthUser> = {
  freelancer: {
    id: 'usr-901',
    name: 'Maria Clara Silveira',
    email: 'maria.clara@trustlink.org',
    role: 'freelancer',
    title: 'Cuidadora Geriátrica Sênior & COREN-SP',
    avatarInitials: 'MC',
    isVerified: true,
    activeContractsCount: 2
  },
  employer: {
    id: 'emp-501',
    name: 'Dra. Beatriz Fontana',
    email: 'beatriz.fontana@hospital.org',
    role: 'employer',
    title: 'Contratante Residencial & Médica Auditada',
    avatarInitials: 'BF',
    isVerified: true,
    activeContractsCount: 2
  }
};

export const primaryFreelancer: FreelancerProfile = {
  id: 'fl-101',
  userId: 'usr-901',
  fullName: 'Maria Clara Silveira',
  title: 'Cuidadora Geriátrica Sênior & Técnica de Enfermagem',
  category: 'Cuidadora de Idosos',
  bio: 'Especialista em cuidados a pacientes com Alzheimer, Parkinson e reabilitação pós-AVC. 8 anos de experiência em residências de alto padrão e acompanhamento hospitalar. Foco em dignidade, rotina humanizada, administração rigorosa de medicamentos e comunicação transparente com a família.',
  city: 'São Paulo',
  neighborhood: 'Jardins / Pinheiros',
  hourlyRate: 48,
  dailyRate: 340,
  experienceYears: 8,
  availability: 'urgency',
  urgencyRadiusKm: 10,
  lat: -23.5615,
  lng: -46.6560,
  completedContractsCount: 14,
  publicRating: 4.96,
  publicReviewCount: 14,
  badges: [
    {
      id: 'bdg-crim',
      type: 'criminal_record',
      title: 'Antecedentes Criminais Verificados',
      issuer: 'Polícia Federal e Tribunal de Justiça de São Paulo',
      verifiedAt: '15/09/2026',
      expiresAt: '15/03/2027',
      status: 'verified',
      documentHash: 'Certidão Negativa nº 2026/0914-PF (Nada Consta)',
      details: 'Certidão negativa de 1º e 2º grau emitida sem nenhum apontamento judicial ou criminal.',
    },
    {
      id: 'bdg-face',
      type: 'facial_biometrics',
      title: 'Identidade e Foto Verificadas',
      issuer: 'Checagem com Documento Oficial de Identidade',
      verifiedAt: '02/10/2026',
      expiresAt: '02/10/2027',
      status: 'verified',
      documentHash: 'Autenticação Biométrica com Prova de Vida Aprovada',
      details: 'Validação facial comparada com foto do documento de identificação original.',
    },
    {
      id: 'bdg-cnh',
      type: 'cnh',
      title: 'CNH Categoria B Regularizada',
      issuer: 'Detran São Paulo',
      verifiedAt: '20/08/2026',
      expiresAt: '20/08/2028',
      status: 'verified',
      documentHash: 'Habilitação Ativa sem Bloqueios',
      details: 'Habilitação válida para transporte emergencial ou deslocamento com o assistido.',
    },
    {
      id: 'bdg-coren',
      type: 'nursing_council',
      title: 'Registro Ativo no COREN-SP',
      issuer: 'Conselho Regional de Enfermagem (São Paulo)',
      verifiedAt: '10/01/2026',
      expiresAt: '31/12/2026',
      status: 'verified',
      documentHash: 'Inscrição Ativa nº 784.912-TE',
      details: 'Habilitada formalmente para cuidados clínicos, curativos estéreis e suporte à saúde.',
    }
  ],
  skills: [
    {
      id: 'sk-1',
      skill: 'Manejo de Crise & Primeiros Socorros',
      verifiedCount: 9,
      validations: [
        {
          employerName: 'Dr. Roberto Vasconcellos',
          employerRole: 'Filho do assistido (Engenheiro Clínico)',
          contractTitle: 'Acompanhamento pós-cirúrgico de 6 meses',
          date: 'Julho 2026',
          verifiedContractId: 'ctr-008'
        },
        {
          employerName: 'Helena Albuquerque',
          employerRole: 'Tutora Legal',
          contractTitle: 'Plantoes noturnos geriátricos',
          date: 'Março 2026',
          verifiedContractId: 'ctr-005'
        }
      ]
    },
    {
      id: 'sk-2',
      skill: 'Administração Controlada de Medicações',
      verifiedCount: 12,
      validations: [
        {
          employerName: 'Família Mendonça Prado',
          employerRole: 'Contratante Residencial',
          contractTitle: 'Cuidadora fixa para Sra. Ivone (84 anos)',
          date: 'Janeiro 2026',
          verifiedContractId: 'ctr-004'
        }
      ]
    },
    {
      id: 'sk-3',
      skill: 'Discrição Absoluta e Sigilo Familiar',
      verifiedCount: 11,
      validations: [
        {
          employerName: 'Dra. Beatriz Fontana',
          employerRole: 'Empregadora Residencial',
          contractTitle: 'Acompanhamento domiciliar em residência privada',
          date: 'Agosto 2026',
          verifiedContractId: 'ctr-012'
        }
      ]
    },
    {
      id: 'sk-4',
      skill: 'Estimulação Cognitiva e Fisioterapia Passiva',
      verifiedCount: 7,
      validations: [
        {
          employerName: 'Eduardo Guimarães',
          employerRole: 'Familiar Responsável',
          contractTitle: 'Rotina de cuidados com Alzheimer nível 2',
          date: 'Maio 2026',
          verifiedContractId: 'ctr-007'
        }
      ]
    }
  ],
  certifications: [
    {
      id: 'crt-1',
      title: 'Técnico em Enfermagem Hospitalar e Domiciliar',
      institution: 'Escola Técnica Albert Einstein / SP',
      year: 2019,
      certificateUrl: 'https://credentials.trustlink.org/crt-einstein-8921',
      verified: true
    },
    {
      id: 'crt-2',
      title: 'Cuidados Avançados em Demências e Alzheimer',
      institution: 'Instituto de Psiquiatria do HC-FMUSP',
      year: 2022,
      certificateUrl: 'https://credentials.trustlink.org/crt-usp-5412',
      verified: true
    },
    {
      id: 'crt-3',
      title: 'Suporte Básico de Vida (BLS - American Heart Association)',
      institution: 'SBC - Sociedade Brasileira de Cardiologia',
      year: 2025,
      certificateUrl: 'https://credentials.trustlink.org/crt-bls-7740',
      verified: true
    }
  ]
};

export const samplePublicReviews: PublicReview[] = [
  {
    id: 'rev-01',
    contractId: 'ctr-012',
    freelancerId: 'fl-101',
    employerName: 'Dra. Beatriz Fontana',
    employerType: 'Empregadora Verificada',
    rating: 5,
    comment: 'A Maria Clara foi um anjo na recuperação da minha mãe após fratura de fêmur. Extremamente atenta aos sinais vitais, medicação no minuto certo e um carinho humano ímpar. Recomendo de olhos fechados.',
    date: '18/09/2026',
    serviceCategory: 'Cuidados Pós-Operatórios Geriátricos',
    contractPeriod: '3 meses (Concluído)'
  },
  {
    id: 'rev-02',
    contractId: 'ctr-008',
    freelancerId: 'fl-101',
    employerName: 'Dr. Roberto Vasconcellos',
    employerType: 'Empregador Auditado',
    rating: 5,
    comment: 'Profissionalismo impecável. Nunca se atrasou um único dia, relatórios diários de glicemia e pressão arterial sempre organizados na planilha familiar. Excelente postura ética.',
    date: '12/07/2026',
    serviceCategory: 'Acompanhamento Contínuo',
    contractPeriod: '6 meses (Concluído)'
  },
  {
    id: 'rev-03',
    contractId: 'ctr-005',
    freelancerId: 'fl-101',
    employerName: 'Helena Albuquerque',
    employerType: 'Empregadora Verificada',
    rating: 5,
    comment: 'Cobriu uma urgência de plantão noturno em menos de 40 minutos pelo Radar. Salvou nossa família em um momento crítico. Gratidão total!',
    date: '28/03/2026',
    serviceCategory: 'Plantão de Urgência Noturna',
    contractPeriod: 'Plantão Único (Concluído)'
  }
];

export const sampleSecretEvaluations: SecretEvaluation[] = [
  {
    id: 'sec-01',
    contractId: 'ctr-012',
    freelancerId: 'fl-101',
    evaluatedAt: '22/09/2026',
    relationshipDuration: '3 meses de convivência diária',
    honestyScore: 10,
    punctualityScore: 9.8,
    emotionalStabilityScore: 9.9,
    discretionConfidentialityScore: 10,
    reactionUnderCrisisScore: 9.7,
    wouldRehirePrivately: true,
    privateNotes: 'Acesso total à residência, cofre e chaves durante viagens da família. Total integridade material e moral. Nunca fez perguntas invasivas e jamais tocou em assuntos particulares fora do escopo profissional. Perfil de ouro para famílias exigentes.',
    hasVerifiedContract: true
  },
  {
    id: 'sec-02',
    contractId: 'ctr-008',
    freelancerId: 'fl-101',
    evaluatedAt: '15/07/2026',
    relationshipDuration: '6 meses de plantões fixos',
    honestyScore: 10,
    punctualityScore: 10,
    emotionalStabilityScore: 9.6,
    discretionConfidentialityScore: 10,
    reactionUnderCrisisScore: 10,
    wouldRehirePrivately: true,
    privateNotes: 'Houve um episódio de broncoaspiração súbita do meu pai durante um almoço. A Maria Clara agiu com frieza exemplar, executou a manobra correta em segundos e acionou o SAMU com protocolo claro. Ela manteve o idoso estabilizado. Não tem preço ter alguém assim em casa.',
    hasVerifiedContract: true
  },
  {
    id: 'sec-03',
    contractId: 'ctr-004',
    freelancerId: 'fl-101',
    evaluatedAt: '05/02/2026',
    relationshipDuration: '4 meses de finais de semana',
    honestyScore: 9.9,
    punctualityScore: 9.7,
    emotionalStabilityScore: 9.8,
    discretionConfidentialityScore: 10,
    reactionUnderCrisisScore: 9.5,
    wouldRehirePrivately: true,
    privateNotes: 'Uso de celular no horário de trabalho apenas para preencher o diário médico ou falar com a supervisão familiar. Extremamente respeitosa com os demais funcionários da casa. Confiabilidade 100%.',
    hasVerifiedContract: true
  }
];

export const sampleContracts: Contract[] = [
  {
    id: 'ctr-012',
    jobId: 'job-901',
    jobTitle: 'Cuidadora Domiciliar Especializada em Pós-Cirúrgico',
    employerId: 'emp-501',
    employerName: 'Dra. Beatriz Fontana',
    freelancerId: 'fl-101',
    freelancerName: 'Maria Clara Silveira',
    category: 'Cuidados Geriátricos',
    type: 'mensal_fixo',
    status: 'completed',
    startDate: '15/06/2026',
    endDate: '15/09/2026',
    agreedRate: 340,
    rateType: 'daily',
    weeklyHours: 44,
    locationAddress: 'Rua Bela Cintra, 1420 - Consolação, São Paulo/SP',
    clauses: [
      'Cláusula 1ª: Objeto - Acompanhamento e administração técnica de cuidados e rotina da assistida.',
      'Cláusula 2ª: Sigilo e Confidencialidade - Obrigação irrestrita de não divulgação de fatos íntimos ou dados da família.',
      'Cláusula 3ª: Integridade e Inventário - Prestação de contas de quaisquer compras e zêlo pelos pertences.',
      'Cláusula 4ª: Aceite de Avaliação Dupla - As partes concordam com registro na plataforma TrustLink mediante finalização.'
    ],
    securityHash: 'TL-CTR-2026-99214-SHA256',
    employerSignedAt: '14/06/2026 19:42',
    freelancerSignedAt: '14/06/2026 20:15',
    canReview: true
  },
  {
    id: 'ctr-015',
    jobId: 'job-905',
    jobTitle: 'Plantão Noturno de Suporte e Monitoramento',
    employerId: 'emp-602',
    employerName: 'Família Guimarães Prado',
    freelancerId: 'fl-101',
    freelancerName: 'Maria Clara Silveira',
    category: 'Enfermagem Noturna',
    type: 'plantao_urgencia',
    status: 'active',
    startDate: '20/10/2026',
    endDate: '20/11/2026',
    agreedRate: 380,
    rateType: 'daily',
    locationAddress: 'Alameda Gabriel Monteiro da Silva, 800 - Jardins, São Paulo/SP',
    clauses: [
      'Cláusula 1ª: Plantão 12x36 noturno com vigilância de oxigenação e sinais vitais.',
      'Cláusula 2ª: Comunicação imediata por canal prioritário TrustLink em caso de intercorrência.'
    ],
    securityHash: 'TL-CTR-2026-44012-SHA256',
    employerSignedAt: '19/10/2026 14:10',
    freelancerSignedAt: '19/10/2026 14:32',
    canReview: false // Bloqueado: contrato ainda ativo!
  }
];

export const sampleRadarFreelancers = [
  {
    id: 'fl-101',
    name: 'Maria Clara Silveira',
    role: 'Cuidadora Geriátrica & Técnica de Enfermagem',
    category: 'Cuidado de Idosos',
    lat: -23.5615,
    lng: -46.6560,
    distanceKm: 1.8,
    urgencyStatus: 'urgency' as const,
    rating: 4.96,
    reviewsCount: 14,
    hourlyRate: 48,
    dailyRate: 340,
    responseTimeMinutes: 12,
    badges: ['Antecedentes PF', 'Check Facial 99.8%', 'COREN Ativo', 'CNH B'],
    phoneMasked: '(11) 98721-****'
  },
  {
    id: 'fl-202',
    name: 'Carlos Eduardo Nogueira',
    role: 'Técnico de Enfermagem & Socorrista APH',
    category: 'Enfermagem & Acompanhamento',
    lat: -23.5505,
    lng: -46.6333,
    distanceKm: 3.4,
    urgencyStatus: 'urgency' as const,
    rating: 4.91,
    reviewsCount: 9,
    hourlyRate: 52,
    dailyRate: 360,
    responseTimeMinutes: 18,
    badges: ['Antecedentes PF', 'Check Facial 99.5%', 'COREN Ativo'],
    phoneMasked: '(11) 97411-****'
  },
  {
    id: 'fl-303',
    name: 'Luciana M. Barreto',
    role: 'Governanta Executiva & Gestão Doméstica',
    category: 'Serviços Domésticos de Confiança',
    lat: -23.5821,
    lng: -46.6800,
    distanceKm: 4.9,
    urgencyStatus: 'online' as const,
    rating: 4.88,
    reviewsCount: 18,
    hourlyRate: 42,
    dailyRate: 290,
    responseTimeMinutes: 30,
    badges: ['Antecedentes PF', 'Check Facial 100%', 'CNH B'],
    phoneMasked: '(11) 99120-****'
  },
  {
    id: 'fl-404',
    name: 'Fernanda Rocha Lima',
    role: 'Babá Especialista em Recém-Nascidos (Neonatal)',
    category: 'Cuidado Infantil',
    lat: -23.5350,
    lng: -46.6900,
    distanceKm: 7.2,
    urgencyStatus: 'urgency' as const,
    rating: 4.98,
    reviewsCount: 22,
    hourlyRate: 55,
    dailyRate: 390,
    responseTimeMinutes: 15,
    badges: ['Antecedentes PF', 'Check Facial 99.9%', 'Pediatria BLS'],
    phoneMasked: '(11) 98344-****'
  },
  {
    id: 'fl-505',
    name: 'Renata V. Albuquerque',
    role: 'Pet Sitter Médica Veterinária (Home Care)',
    category: 'Pet Care de Alta Confiança',
    lat: -23.5900,
    lng: -46.6300,
    distanceKm: 8.6,
    urgencyStatus: 'urgency' as const,
    rating: 4.94,
    reviewsCount: 16,
    hourlyRate: 45,
    dailyRate: 300,
    responseTimeMinutes: 20,
    badges: ['Antecedentes PF', 'CRMV-SP Ativo', 'Check Facial'],
    phoneMasked: '(11) 97655-****'
  },
  {
    id: 'fl-606',
    name: 'Juliana P. Castro',
    role: 'Cuidadora de Idosos com foco em Parkinson',
    category: 'Cuidado de Idosos',
    lat: -23.6300,
    lng: -46.7100,
    distanceKm: 13.8, // Fora do raio de 10km para demonstrar filtro PostGIS
    urgencyStatus: 'urgency' as const,
    rating: 4.85,
    reviewsCount: 7,
    hourlyRate: 40,
    dailyRate: 280,
    responseTimeMinutes: 45,
    badges: ['Antecedentes PF', 'Check Facial'],
    phoneMasked: '(11) 98822-****'
  }
];

export const sampleFeedPosts: FeedPost[] = [
  {
    id: 'pst-01',
    authorId: 'fl-101',
    authorName: 'Maria Clara Silveira',
    authorRole: 'Cuidadora Geriátrica Sênior & COREN-SP',
    authorCategory: 'Cuidados Geriátricos',
    avatarSeed: 'maria',
    verifiedBadgesCount: 4,
    createdAt: 'Ontem às 16:40',
    content: 'Certificado renovado! Conclusão da reciclagem em Suporte Básico de Vida (BLS) pela American Heart Association. Na rotina com pacientes idosos e de alta fragilidade clínica, estar preparado para manobras de desengasgo e reanimação em segundos é a diferença entre a vida e o imprevisto. Registro já verificado pela TrustLink.',
    type: 'certification',
    mediaTitle: 'Certificado BLS - American Heart Association (ID #BLS-2026-902)',
    mediaSubtext: 'Credencial emitida em 10/2026 · Válida até 10/2028 · Autenticada',
    likesCount: 38,
    endorsementsCount: 12,
    hasVerifiedExEmployerEndorsement: true,
    endorsedByEmployer: 'Dr. Roberto Vasconcellos (Ex-Empregador Verificado): "Profissional que estuda e se aprimora constantemente. Parabéns pela dedicação!"'
  },
  {
    id: 'pst-02',
    authorId: 'fl-101',
    authorName: 'Maria Clara Silveira',
    authorRole: 'Cuidadora Geriátrica Sênior & COREN-SP',
    authorCategory: 'Cuidados Geriátricos',
    avatarSeed: 'maria',
    verifiedBadgesCount: 4,
    createdAt: 'Há 3 dias',
    content: 'Rotina matinal humanizada com a assistida: além da checagem rigorosa de pressão e dextro, incluímos 25 minutos de estimulação cognitiva com álbum de memórias da família e música clássica. O bem-estar psicológico é tão vital quanto o farmacológico.',
    type: 'daily_routine',
    mediaTitle: 'Plano Terapêutico Domiciliar Semanal',
    mediaSubtext: 'Diário de rotina médica compartilhada em tempo real com a família',
    likesCount: 54,
    endorsementsCount: 8,
    hasVerifiedExEmployerEndorsement: true,
    endorsedByEmployer: 'Dra. Beatriz Fontana (Ex-Empregadora): "Esse acompanhamento com carinho e método fez toda a diferença na recuperação da minha mãe."'
  }
];

export const samplePipelineItems: JobPipelineItem[] = [
  {
    id: 'pipe-01',
    candidateId: 'fl-101',
    candidateName: 'Maria Clara Silveira',
    candidateRole: 'Cuidadora Geriátrica & COREN-SP',
    experienceYears: 8,
    rating: 4.96,
    distanceKm: 1.8,
    stage: 'proposta',
    salaryExpectation: 340,
    badgesCount: 4,
    appliedDate: 'Hoje às 08:30',
    contractId: 'ctr-015'
  },
  {
    id: 'pipe-02',
    candidateId: 'fl-202',
    candidateName: 'Carlos Eduardo Nogueira',
    candidateRole: 'Técnico de Enfermagem & Socorrista',
    experienceYears: 6,
    rating: 4.91,
    distanceKm: 3.4,
    stage: 'entrevista',
    salaryExpectation: 360,
    badgesCount: 3,
    appliedDate: 'Ontem às 14:15'
  },
  {
    id: 'pipe-03',
    candidateId: 'fl-303',
    candidateName: 'Luciana M. Barreto',
    candidateRole: 'Governanta Residencial de Confiança',
    experienceYears: 10,
    rating: 4.88,
    distanceKm: 4.9,
    stage: 'triagem',
    salaryExpectation: 290,
    badgesCount: 3,
    appliedDate: 'Há 2 dias'
  },
  {
    id: 'pipe-04',
    candidateId: 'fl-101-hist',
    candidateName: 'Maria Clara Silveira',
    candidateRole: 'Cuidadora Pós-Cirúrgico',
    experienceYears: 8,
    rating: 4.96,
    distanceKm: 1.8,
    stage: 'contratado',
    salaryExpectation: 340,
    badgesCount: 4,
    appliedDate: '15/06/2026',
    contractId: 'ctr-012'
  }
];

export const sampleActiveSessions: ActiveSession[] = [
  {
    id: 'sess-current',
    device: 'MacBook Pro 16" (macOS Sequoia)',
    browser: 'Chrome 130 · Sessão Principal',
    ip: '177.136.88.14',
    location: 'São Paulo, Brasil',
    lastActive: 'Agora mesmo',
    isCurrent: true,
    expiresInMinutes: 14 // Access Token 15 min
  },
  {
    id: 'sess-mobile',
    device: 'iPhone 15 Pro (iOS 18.2)',
    browser: 'Mobile Safari · App TrustLink PWA',
    ip: '177.136.88.92',
    location: 'São Paulo, Brasil',
    lastActive: 'Há 18 minutos',
    isCurrent: false,
    expiresInMinutes: 7
  },
  {
    id: 'sess-tablet',
    device: 'iPad Air 5th Gen (iPadOS)',
    browser: 'Mobile Safari',
    ip: '189.40.112.50',
    location: 'Campinas, Brasil',
    lastActive: 'Há 4 dias',
    isCurrent: false,
    expiresInMinutes: 0
  }
];

export const sampleCaregiverProfiles: FreelancerProfile[] = [
  primaryFreelancer,
  {
    id: 'fl-202',
    userId: 'usr-902',
    fullName: 'Carlos Eduardo Nogueira',
    title: 'Técnico de Enfermagem & Socorrista APH',
    category: 'Técnica de Enfermagem',
    bio: 'Experiência de 6 anos em UTI móvel e atendimento hospitalar e domiciliar de alta complexidade. Habilitado em punção venosa, curativos estéreis de grau avançado, aspiração de vias aéreas e cuidados a pacientes traqueostomizados ou com sonda GTT/SNE.',
    city: 'São Paulo',
    neighborhood: 'Bela Vista / Paraíso',
    hourlyRate: 52,
    dailyRate: 360,
    experienceYears: 6,
    availability: 'urgency',
    urgencyRadiusKm: 10,
    lat: -23.5505,
    lng: -46.6333,
    completedContractsCount: 11,
    publicRating: 4.91,
    publicReviewCount: 9,
    badges: [
      {
        id: 'bdg-crim-202',
        type: 'criminal_record',
        title: 'Antecedentes Criminais Verificados',
        issuer: 'Polícia Federal e TJ-SP',
        verifiedAt: '12/08/2026',
        expiresAt: '12/02/2027',
        status: 'verified',
        documentHash: 'Certidão Negativa nº 2026/0812-PF',
        details: 'Nenhum registro criminal ou pendência jurídica.'
      },
      {
        id: 'bdg-face-202',
        type: 'facial_biometrics',
        title: 'Identidade e Biometria Aprovada',
        issuer: 'Checagem com Documento Oficial',
        verifiedAt: '14/08/2026',
        expiresAt: '14/08/2027',
        status: 'verified',
        documentHash: 'Prova de Vida Facial 99.5%',
        details: 'Identidade confirmada com documento com foto.'
      },
      {
        id: 'bdg-coren-202',
        type: 'nursing_council',
        title: 'COREN-SP Técnico Ativo',
        issuer: 'Conselho Regional de Enfermagem SP',
        verifiedAt: '05/02/2026',
        expiresAt: '31/12/2026',
        status: 'verified',
        documentHash: 'Inscrição Ativa nº 649.201-TE',
        details: 'Regular para procedimentos de enfermagem invasivos e cuidados intensivos.'
      }
    ],
    skills: [
      {
        id: 'sk-c1',
        skill: 'Cuidados com Traqueostomia e Aspiração',
        verifiedCount: 8,
        validations: [
          {
            employerName: 'Família Barcellos',
            employerRole: 'Contratante Residencial',
            contractTitle: 'Home Care pós-AVC',
            date: 'Junho 2026',
            verifiedContractId: 'ctr-021'
          }
        ]
      },
      {
        id: 'sk-c2',
        skill: 'Administração de Terapia Endovenosa e Sondas',
        verifiedCount: 10,
        validations: [
          {
            employerName: 'Hospitalar Home Service',
            employerRole: 'Coordenadora Clínica',
            contractTitle: 'Plantão Noturno Domiciliar',
            date: 'Maio 2026',
            verifiedContractId: 'ctr-019'
          }
        ]
      }
    ],
    certifications: [
      {
        id: 'crt-c1',
        title: 'Atendimento Pré-Hospitalar (APH 120h)',
        institution: 'Cruz Vermelha Brasileira',
        year: 2022,
        certificateUrl: 'https://credentials.trustlink.org/aph-6612',
        verified: true
      }
    ]
  },
  {
    id: 'fl-303',
    userId: 'usr-903',
    fullName: 'Luciana M. Barreto',
    title: 'Governanta Executiva & Gestão Doméstica',
    category: 'Governanta Doméstica',
    bio: '10 anos de carreira coordenando residências de alto padrão nos bairros Jardins, Moema e Morumbi. Especialista em gestão de equipes, compras com prestação de contas diária, controle de cardápio e conservação de pratarias e obras de arte.',
    city: 'São Paulo',
    neighborhood: 'Moema / Vila Nova Conceição',
    hourlyRate: 42,
    dailyRate: 290,
    experienceYears: 10,
    availability: 'online',
    urgencyRadiusKm: 8,
    lat: -23.5821,
    lng: -46.6800,
    completedContractsCount: 19,
    publicRating: 4.88,
    publicReviewCount: 18,
    badges: [
      {
        id: 'bdg-crim-303',
        type: 'criminal_record',
        title: 'Antecedentes Criminais Verificados',
        issuer: 'Polícia Federal e TJ-SP',
        verifiedAt: '01/09/2026',
        expiresAt: '01/03/2027',
        status: 'verified',
        documentHash: 'Certidão Negativa nº 2026/0901-PF',
        details: 'Certidão sem registros judiciais.'
      },
      {
        id: 'bdg-face-303',
        type: 'facial_biometrics',
        title: 'Identidade e Biometria Aprovada',
        issuer: 'Checagem com Documento Oficial',
        verifiedAt: '03/09/2026',
        expiresAt: '03/09/2027',
        status: 'verified',
        documentHash: 'Prova de Vida Facial 100%',
        details: 'Identidade confirmada.'
      },
      {
        id: 'bdg-cnh-303',
        type: 'cnh',
        title: 'CNH Categoria B Ativa',
        issuer: 'Detran São Paulo',
        verifiedAt: '10/05/2025',
        expiresAt: '10/05/2030',
        status: 'verified',
        documentHash: 'Habilitação Válida',
        details: 'Disponibilidade para compras e locomoção da rotina familiar.'
      }
    ],
    skills: [
      {
        id: 'sk-l1',
        skill: 'Prestação de Contas & Organização Residencial',
        verifiedCount: 14,
        validations: [
          {
            employerName: 'Família Rocha Azevedo',
            employerRole: 'Contratante',
            contractTitle: 'Gestão Residencial Contínua',
            date: 'Agosto 2026',
            verifiedContractId: 'ctr-033'
          }
        ]
      }
    ],
    certifications: [
      {
        id: 'crt-l1',
        title: 'Especialização em Governança Hoteleira e Domiciliar',
        institution: 'Senac São Paulo',
        year: 2018,
        certificateUrl: 'https://credentials.trustlink.org/gov-8821',
        verified: true
      }
    ]
  },
  {
    id: 'fl-404',
    userId: 'usr-904',
    fullName: 'Fernanda Rocha Lima',
    title: 'Babá Especialista em Recém-Nascidos (Neonatal)',
    category: 'Babá / Cuidadora Infantil',
    bio: 'Pedagoga com especialização em sono infantil, cuidados com recém-nascidos e introdução alimentar respeitosa. Mais de 7 anos cuidando de bebês de famílias que prezam por discrição e segurança.',
    city: 'São Paulo',
    neighborhood: 'Perdizes / Pompéia',
    hourlyRate: 55,
    dailyRate: 390,
    experienceYears: 7,
    availability: 'urgency',
    urgencyRadiusKm: 10,
    lat: -23.5350,
    lng: -46.6900,
    completedContractsCount: 22,
    publicRating: 4.98,
    publicReviewCount: 22,
    badges: [
      {
        id: 'bdg-crim-404',
        type: 'criminal_record',
        title: 'Antecedentes Criminais Verificados',
        issuer: 'Polícia Federal e TJ-SP',
        verifiedAt: '20/09/2026',
        expiresAt: '20/03/2027',
        status: 'verified',
        documentHash: 'Certidão Negativa nº 2026/0920-PF',
        details: 'Antecedentes negativos e certidões cíveis limpas.'
      },
      {
        id: 'bdg-face-404',
        type: 'facial_biometrics',
        title: 'Identidade e Biometria Aprovada',
        issuer: 'Checagem com Documento Oficial',
        verifiedAt: '22/09/2026',
        expiresAt: '22/09/2027',
        status: 'verified',
        documentHash: 'Prova de Vida Facial 99.9%',
        details: 'Identidade confirmada.'
      }
    ],
    skills: [
      {
        id: 'sk-f1',
        skill: 'Higiene Neonatal e Suporte à Amamentação',
        verifiedCount: 16,
        validations: [
          {
            employerName: 'Dra. Camila Nogueira',
            employerRole: 'Mãe e Médica Pediatra',
            contractTitle: 'Cuidados Neonatais Primeiros 90 Dias',
            date: 'Julho 2026',
            verifiedContractId: 'ctr-045'
          }
        ]
      }
    ],
    certifications: [
      {
        id: 'crt-f1',
        title: 'Suporte Básico de Vida em Pediatria (PALS / BLS)',
        institution: 'American Heart Association',
        year: 2024,
        certificateUrl: 'https://credentials.trustlink.org/pals-3312',
        verified: true
      }
    ]
  },
  {
    id: 'fl-505',
    userId: 'usr-905',
    fullName: 'Renata V. Albuquerque',
    title: 'Pet Sitter Médica Veterinária (Home Care)',
    category: 'Pet Sitter Especializado',
    bio: 'Médica Veterinária formada pela USP, com foco em atendimento pet domiciliar para animais que exigem cuidados médicos: idosos, diabéticos em insulinoterapia, com problemas renais ou em pós-operatório ortopédico.',
    city: 'São Paulo',
    neighborhood: 'Itaim Bibi / Vila Olímpia',
    hourlyRate: 45,
    dailyRate: 300,
    experienceYears: 5,
    availability: 'urgency',
    urgencyRadiusKm: 10,
    lat: -23.5900,
    lng: -46.6300,
    completedContractsCount: 17,
    publicRating: 4.94,
    publicReviewCount: 16,
    badges: [
      {
        id: 'bdg-crim-505',
        type: 'criminal_record',
        title: 'Antecedentes Criminais Verificados',
        issuer: 'Polícia Federal e TJ-SP',
        verifiedAt: '05/10/2026',
        expiresAt: '05/04/2027',
        status: 'verified',
        documentHash: 'Certidão Negativa nº 2026/1005-PF',
        details: 'Antecedentes limpos.'
      },
      {
        id: 'bdg-crmv-505',
        type: 'nursing_council',
        title: 'CRMV-SP Ativo (Conselho de Medicina Veterinária)',
        issuer: 'CRMV Estado de São Paulo',
        verifiedAt: '15/01/2026',
        expiresAt: '31/12/2026',
        status: 'verified',
        documentHash: 'CRMV-SP nº 49.120',
        details: 'Habilitada para administração de medicação injetável e suporte veterinário.'
      }
    ],
    skills: [
      {
        id: 'sk-r1',
        skill: 'Fluidoterapia & Medicação Injetável em Cães e Gatos',
        verifiedCount: 12,
        validations: [
          {
            employerName: 'Gabriel Siqueira',
            employerRole: 'Tutor de Golden Retriever Idoso',
            contractTitle: 'Cuidados Pós-Cirúrgico Ortopédico',
            date: 'Setembro 2026',
            verifiedContractId: 'ctr-051'
          }
        ]
      }
    ],
    certifications: [
      {
        id: 'crt-r1',
        title: 'Graduação em Medicina Veterinária',
        institution: 'Universidade de São Paulo (USP)',
        year: 2021,
        certificateUrl: 'https://credentials.trustlink.org/vet-usp-1029',
        verified: true
      }
    ]
  },
  {
    id: 'fl-606',
    userId: 'usr-906',
    fullName: 'Juliana P. Castro',
    title: 'Cuidadora de Idosos com Foco em Estimulação Cognitiva',
    category: 'Cuidadora de Idosos',
    bio: '4 anos de dedicação exclusiva ao cuidado geriátrico. Treinada em exercícios de memória, estímulos motores suaves e companhia alegre. Pontual, comunicativa e atenta à rotina dos assistidos.',
    city: 'São Paulo',
    neighborhood: 'Morumbi / Campo Belo',
    hourlyRate: 40,
    dailyRate: 280,
    experienceYears: 4,
    availability: 'online',
    urgencyRadiusKm: 15,
    lat: -23.6300,
    lng: -46.7100,
    completedContractsCount: 8,
    publicRating: 4.85,
    publicReviewCount: 7,
    badges: [
      {
        id: 'bdg-crim-606',
        type: 'criminal_record',
        title: 'Antecedentes Criminais Verificados',
        issuer: 'Polícia Federal e TJ-SP',
        verifiedAt: '18/07/2026',
        expiresAt: '18/01/2027',
        status: 'verified',
        documentHash: 'Certidão Negativa nº 2026/0718-PF',
        details: 'Nenhuma ocorrência judicial.'
      },
      {
        id: 'bdg-face-606',
        type: 'facial_biometrics',
        title: 'Identidade e Foto Verificadas',
        issuer: 'Validação Oficial com Documento',
        verifiedAt: '19/07/2026',
        expiresAt: '19/07/2027',
        status: 'verified',
        documentHash: 'Prova de Vida Facial Aprovada',
        details: 'Identidade conferida.'
      }
    ],
    skills: [
      {
        id: 'sk-j1',
        skill: 'Estimulação de Memória e Recreação Sênior',
        verifiedCount: 6,
        validations: [
          {
            employerName: 'Família Arantes',
            employerRole: 'Contratante Residencial',
            contractTitle: 'Acompanhamento Diurno',
            date: 'Junho 2026',
            verifiedContractId: 'ctr-058'
          }
        ]
      }
    ],
    certifications: [
      {
        id: 'crt-j1',
        title: 'Curso de Formação Profissional para Cuidadores de Idosos',
        institution: 'Senac São Paulo (160h)',
        year: 2022,
        certificateUrl: 'https://credentials.trustlink.org/senac-9912',
        verified: true
      }
    ]
  }
];

export const sampleJobAnnouncements: JobAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'Cuidadora Geriátrica Residente / Acompanhamento Diurno',
    employerId: 'emp-501',
    employerName: 'Dra. Beatriz Fontana (Família Fontana)',
    employerType: 'Residência Verificada · Membro Auditado TrustLink',
    location: 'Jardins, São Paulo · 1.8 km de você',
    workSchedule: 'Segunda a Sexta · 08h às 17h (44h semanais)',
    contractType: 'mensal_fixo',
    rateDescription: 'R$ 5.200,00 / mês',
    rateAmount: 5200,
    postedAt: 'Há 2 dias',
    status: 'active',
    urgency: false,
    description: 'Buscamos profissional de perfil humanizado e de alta confiança para assistência à nossa mãe (81 anos), lúcida, em recuperação pós-cirúrgica de prótese de quadril. Ambiente familiar tranquilo, seguro e com respeito mútuo absoluto. Contrato formal gerado na TrustLink com todas as garantias legais e de sigilo.',
    responsibilities: [
      'Auxílio no banho e higiene pessoal com segurança motora e dignidade',
      'Administração e controle de receituário médico em tabela organizada',
      'Acompanhamento nas sessões de fisioterapia domiciliar e caminhadas leves no prédio',
      'Companhia ativa para leitura, jogos de memória e conversação humanizada',
      'Passagem de relatório diário pelo diário de bordo do TrustLink'
    ],
    requiredBadges: [
      'Antecedentes Criminais PF e TJ (Nada Consta)',
      'Checagem Facial com Documento Oficial',
      'COREN Ativo ou Certificado Técnico Sênior',
      'Referências Anteriores de Famílias Verificadas'
    ],
    benefits: [
      'Alimentação de alta qualidade no local de trabalho',
      'Auxílio Transporte / Reembolso Uber em dias chuvosos',
      'Contrato Digital formalizado com Cláusula de Sigilo Mútuo',
      'Folga garantida aos sábados, domingos e feriados nacionais'
    ],
    applicants: [
      {
        id: 'app-01',
        candidateId: 'fl-101',
        candidateName: 'Maria Clara Silveira',
        candidateRole: 'Cuidadora Geriátrica Sênior & COREN-SP',
        avatarSeed: 'maria',
        rating: 4.96,
        reviewCount: 14,
        distanceKm: 1.8,
        salaryExpectation: 340,
        stage: 'proposta',
        appliedDate: 'Hoje às 08:30',
        badges: ['Antecedentes PF', 'Check Facial 99.8%', 'COREN Ativo', 'CNH B'],
        coverNote: 'Tenho 8 anos de experiência em reabilitação ortopédica em idosos lúcidos. Prezo imensamente pela pontualidade, rotina serena e diálogo transparente com os familiares.',
        contractId: 'ctr-015',
        confidentialFeedbackSnippet: 'Avaliação sigilosa de ex-família: Nota 10 em honestidade e discrição absoluta. Teve acesso a cômodos privativos sem qualquer intercorrência.'
      },
      {
        id: 'app-02',
        candidateId: 'fl-202',
        candidateName: 'Carlos Eduardo Nogueira',
        candidateRole: 'Técnico de Enfermagem & Socorrista APH',
        avatarSeed: 'carlos',
        rating: 4.91,
        reviewCount: 9,
        distanceKm: 3.4,
        salaryExpectation: 360,
        stage: 'entrevista',
        appliedDate: 'Ontem às 14:15',
        badges: ['Antecedentes PF', 'Check Facial 99.5%', 'COREN Ativo'],
        coverNote: 'Formação em reabilitação motora e suporte hospitalar intensivo. Disponibilidade imediata para início com a família Fontana.',
        confidentialFeedbackSnippet: 'Avaliação sigilosa: Reação sob crise nota 10. Agilidade e precisão técnica em primeiros socorros.'
      },
      {
        id: 'app-03',
        candidateId: 'fl-303',
        candidateName: 'Luciana M. Barreto',
        candidateRole: 'Governanta Residencial & Gestão de Rotina',
        avatarSeed: 'luciana',
        rating: 4.88,
        reviewCount: 18,
        distanceKm: 4.9,
        salaryExpectation: 290,
        stage: 'triagem',
        appliedDate: 'Há 2 dias',
        badges: ['Antecedentes PF', 'Check Facial 100%', 'CNH B'],
        coverNote: '10 anos de experiência em suporte a idosos de famílias exigentes em São Paulo. Foco em nutrição balanceada e organização exemplar.',
        confidentialFeedbackSnippet: 'Avaliação sigilosa: Integridade material incontestável e respeito rigoroso às regras da residência.'
      },
      {
        id: 'app-04',
        candidateId: 'fl-606',
        candidateName: 'Juliana P. Castro',
        candidateRole: 'Cuidadora de Idosos com foco em Parkinson',
        avatarSeed: 'juliana',
        rating: 4.85,
        reviewCount: 7,
        distanceKm: 6.2,
        salaryExpectation: 280,
        stage: 'triagem',
        appliedDate: 'Há 3 dias',
        badges: ['Antecedentes PF', 'Check Facial'],
        coverNote: 'Certificada pelo Senac. Muito carinho, paciência e dedicação na estimulação cognitiva diária.',
        confidentialFeedbackSnippet: 'Avaliação sigilosa: Excelente empatia interpessoal e afetuosa com a assistida.'
      }
    ]
  },
  {
    id: 'ann-02',
    title: 'Plantão Noturno 12h Alzheimer - Higienópolis',
    employerId: 'emp-501',
    employerName: 'Dra. Beatriz Fontana (Família Fontana)',
    employerType: 'Residência Verificada · Membro Auditado TrustLink',
    location: 'Higienópolis, São Paulo · 2.1 km de você',
    workSchedule: 'Plantão Noturno · 19h às 07h (Escala 12x36)',
    contractType: 'plantao_urgencia',
    rateDescription: 'R$ 380,00 / plantão',
    rateAmount: 380,
    postedAt: 'Há 4 horas',
    status: 'active',
    urgency: true,
    description: 'Vaga prioritária para acompanhamento noturno de senhor de 84 anos com Alzheimer moderado. Quarto privativo com monitor de sinais vitais, medicação noturna prescrita e vigilância do sono para prevenir quedas. Buscamos perfil vigilante e calmo.',
    responsibilities: [
      'Monitoramento atento durante a noite para evitar que o assistido levante desacompanhado',
      'Administração pontual da medicação neurológica às 21h e 06h com registro no app',
      'Auxílio calmo e sereno em episódios eventuais de confusão noturna (Sundowning)',
      'Passagem de plantão detalhada por escrito para a cuidadora diurna às 07h'
    ],
    requiredBadges: [
      'Antecedentes Criminais PF e TJ Validados',
      'Checagem Facial Biometrica',
      'Experiência prévia com pacientes de Alzheimer'
    ],
    benefits: [
      'Jantar e café da manhã fornecidos pela residência',
      'Adicional noturno pago integralmente no encerramento do plantão',
      'Minuta de contrato instantânea via TrustLink com cobertura contra sinistros'
    ],
    applicants: [
      {
        id: 'app-05',
        candidateId: 'fl-202',
        candidateName: 'Carlos Eduardo Nogueira',
        candidateRole: 'Técnico de Enfermagem & Socorrista APH',
        avatarSeed: 'carlos',
        rating: 4.91,
        reviewCount: 9,
        distanceKm: 2.1,
        salaryExpectation: 380,
        stage: 'entrevista',
        appliedDate: 'Há 3 horas',
        badges: ['Antecedentes PF', 'Check Facial 99.5%', 'COREN Ativo'],
        coverNote: 'Plantões noturnos são minha especialidade. Tenho protocolo rígido para prevenção de quedas noturnas e manejo de desorientação.',
        confidentialFeedbackSnippet: 'Avaliação sigilosa: Pontualidade britânica, nunca dorme em serviço.'
      },
      {
        id: 'app-06',
        candidateId: 'fl-606',
        candidateName: 'Juliana P. Castro',
        candidateRole: 'Cuidadora de Idosos com foco em Demências',
        avatarSeed: 'juliana',
        rating: 4.85,
        reviewCount: 7,
        distanceKm: 5.4,
        salaryExpectation: 350,
        stage: 'triagem',
        appliedDate: 'Há 4 horas',
        badges: ['Antecedentes PF', 'Check Facial'],
        coverNote: 'Paciência redobrada com síndrome do entardecer. Experiência de 5 anos em geriatria residencial.',
        confidentialFeedbackSnippet: 'Avaliação sigilosa: Calma reconfortante em situações de agitação do paciente.'
      }
    ]
  },
  {
    id: 'ann-03',
    title: 'Acompanhamento Pós-Cirúrgico & Fisioterapia (Pinheiros)',
    employerId: 'emp-501',
    employerName: 'Dra. Beatriz Fontana (Família Fontana)',
    employerType: 'Residência Verificada · Membro Auditado TrustLink',
    location: 'Pinheiros, São Paulo · 1.5 km de você',
    workSchedule: 'Plantões de Finais de Semana · Sábado e Domingo (08h às 20h)',
    contractType: 'diario',
    rateDescription: 'R$ 350,00 / diária',
    rateAmount: 350,
    postedAt: 'Há 1 dia',
    status: 'active',
    urgency: false,
    description: 'Suporte especializado para paciente pós-artroplastia total de joelho nos finais de semana. Estimulação de exercícios passivos prescritos pelo fisioterapeuta, aplicação de compressas e supervisão contínua.',
    responsibilities: [
      'Execução dos exercícios domiciliares de fisioterapia prescritos',
      'Cuidados com a incisão cirúrgica e aplicação de crioterapia',
      'Auxílio na deambulação com andador e prevenção de esforço excessivo'
    ],
    requiredBadges: [
      'Antecedentes Criminais PF Validados',
      'COREN Ativo ou Curso Técnico de Enfermagem'
    ],
    benefits: [
      'Ambiente agradável e família acolhedora',
      'Contrato firmado na plataforma',
      'Refeições inclusas'
    ],
    applicants: [
      {
        id: 'app-07',
        candidateId: 'fl-101',
        candidateName: 'Maria Clara Silveira',
        candidateRole: 'Cuidadora Geriátrica Sênior & COREN-SP',
        avatarSeed: 'maria',
        rating: 4.96,
        reviewCount: 14,
        distanceKm: 1.5,
        salaryExpectation: 350,
        stage: 'contratado',
        appliedDate: 'Há 1 dia',
        badges: ['Antecedentes PF', 'Check Facial 99.8%', 'COREN Ativo', 'CNH B'],
        coverNote: 'Disponibilidade para os finais de semana solicitados. Conheço bem a rotina de reabilitação pós-artroplastia.',
        contractId: 'ctr-012',
        confidentialFeedbackSnippet: 'Avaliação sigilosa: Atendimento de excelência técnica comprovado.'
      }
    ]
  },
  {
    id: 'ann-04',
    title: 'Técnico de Enfermagem para Home Care (Bela Vista)',
    employerId: 'emp-702',
    employerName: 'Família Mendonça & Associados',
    employerType: 'Residência Verificada TrustLink',
    location: 'Bela Vista, São Paulo · 2.8 km de você',
    workSchedule: 'Diurno · 07h às 19h (Escala 12x36)',
    contractType: 'diario',
    rateDescription: 'R$ 370,00 / plantão',
    rateAmount: 370,
    postedAt: 'Há 6 horas',
    status: 'active',
    urgency: false,
    description: 'Vaga para acompanhamento técnico de paciente traqueostomizado em domicílio. Necessária experiência com aspiração traqueal, dieta enteral por sonda GTT e monitorização de oximetria contínua.',
    responsibilities: [
      'Aspiração de vias aéreas superiores e traqueostomia com técnica asséptica',
      'Administração e controle de infusão de dieta por sonda',
      'Mudança periódica de decúbito para prevenção de LPP (lesão por pressão)'
    ],
    requiredBadges: [
      'COREN-SP Ativo Obrigatório',
      'Antecedentes Criminais PF',
      'Check Facial 100%'
    ],
    benefits: [
      'Equipamentos hospitalares de última geração no domicílio',
      'Pagamento pontual semanal via TrustLink Pay',
      'Apoio de médico da família para intercorrências'
    ],
    applicants: []
  },
  {
    id: 'ann-05',
    title: 'Babá Folguista Fins de Semana & Cuidados Infantis (Moema)',
    employerId: 'emp-804',
    employerName: 'Família Camargo',
    employerType: 'Residência Verificada TrustLink',
    location: 'Moema Pássaros, São Paulo · 5.1 km de você',
    workSchedule: 'Sexta às 18h até Domingo às 18h',
    contractType: 'diario',
    rateDescription: 'R$ 450,00 / diária',
    rateAmount: 450,
    postedAt: 'Há 1 dia',
    status: 'active',
    urgency: false,
    description: 'Família com 2 crianças (3 e 6 anos) busca profissional carinhosa, com formação em pedagogia ou enfermagem pediátrica, para apoio aos pais durante os finais de semana.',
    responsibilities: [
      'Estimulação lúdica e atividades pedagógicas ao ar livre no parque',
      'Preparo de refeições saudáveis e nutrição infantil equilibrada',
      'Rotina de sono tranquila e auxílio em banho com segurança'
    ],
    requiredBadges: [
      'Antecedentes Criminais PF',
      'Curso de Primeiros Socorros / BLS Pediátrico',
      'Check Facial Biométrico'
    ],
    benefits: [
      'Suíte privativa para descanso no domicílio',
      'Alimentação completa e ambiente respeitoso',
      'Contrato formal com seguro civil'
    ],
    applicants: []
  }
];
