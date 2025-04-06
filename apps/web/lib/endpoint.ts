export const endpoints = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    signup: "/auth/signup",
  },

  users: {
    me: "/users/me",
    all: "/users",
    find: (userId: string) => `/users/${userId}`,
    update: (userId: string) => `/users/${userId}`,
    delete: (userId: string) => `/users/${userId}`,
  },

  companies: {
    all: "/companies",
    find: (companyId: string) => `/companies/${companyId}`,
    update: (companyId: string) => `/companies/${companyId}`,
    delete: (companyId: string) => `/companies/${companyId}`,
    coreValues: {
      all: (companyId: string) => `/companies/${companyId}/core-values`,
      create: (companyId: string) => `/companies/${companyId}/core-values`,
      update: (companyId: string, valueId: string) =>
        `/companies/${companyId}/core-values/${valueId}`,
      delete: (companyId: string, valueId: string) =>
        `/companies/${companyId}/core-values/${valueId}`,
    },
  },

  templates: {
    all: (companyId: string) => `/templates/company/${companyId}`,
    create: (companyId: string) => `/templates/company/${companyId}`,
    find: (templateId: string) => `/templates/${templateId}`,
    update: (templateId: string) => `/templates/${templateId}`,
    delete: (templateId: string) => `/templates/${templateId}`,
  },

  roles: {
    all: (companyId: string) => `/companies/${companyId}/roles`,
    create: (companyId: string) => `/companies/${companyId}/roles`,
    find: (companyId: string, roleId: string) =>
      `/companies/${companyId}/roles/${roleId}`,
    update: (companyId: string, roleId: string) =>
      `/companies/${companyId}/roles/${roleId}`,
    delete: (companyId: string, roleId: string) =>
      `/companies/${companyId}/roles/${roleId}`,
  },

  candidates: {
    all: (companyId: string) => `/companies/${companyId}/candidates`,
    create: (companyId: string) => `/companies/${companyId}/candidates`,
    find: (companyId: string, candidateId: string) =>
      `/companies/${companyId}/candidates/${candidateId}`,
    update: (companyId: string, candidateId: string) =>
      `/companies/${companyId}/candidates/${candidateId}`,
    delete: (companyId: string, candidateId: string) =>
      `/companies/${companyId}/candidates/${candidateId}`,
  },

  interviews: {
    all: (companyId: string) => `/companies/${companyId}/interviews`,
    create: (companyId: string) => `/companies/${companyId}/interviews`,
    find: (interviewId: string) =>
      `/candidates/:candidateId/interviews/${interviewId}`,
    update: (interviewId: string) =>
      `/candidates/:candidateId/interviews/${interviewId}`,
    delete: (candidateId: string, interviewId: string) =>
      `/candidates/${candidateId}/interviews/${interviewId}`,
  },

  evaluations: {
    create: (interviewId: string) => `/interviews/${interviewId}/evaluations`,
    find: (interviewId: string) => `/interviews/${interviewId}/evaluations`,
    update: (interviewId: string) => `/interviews/${interviewId}/evaluations`,
  },

  feedback: {
    create: (evaluationId: string) => `/evaluations/${evaluationId}/feedback`,
    find: (evaluationId: string) => `/evaluations/${evaluationId}/feedback`,
  },

  upload: {
    generateUrl: "/upload/generate-url",
    getPublicUri: (filename: string) => `/upload/public-uri/${filename}`,
  },

  public: {
    accessInterview: (token: string) => `/public/interviews/${token}`,
  },
};
