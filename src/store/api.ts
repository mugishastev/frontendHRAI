import { createApi, fetchBaseQuery, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-hrai.vercel.app/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('umurava_token') : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper that auto-logs out on 401 (expired/missing token) or 403 (forbidden)
const baseQueryWithReauth = async (args: string | FetchArgs, api: any, extraOptions: any) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = (result.error as FetchBaseQueryError).status;
    if (status === 401 || status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('umurava_token');
        localStorage.removeItem('umurava_role');
        localStorage.removeItem('umurava_email');
        window.location.href = '/login';
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Job', 'Applicant', 'Screening', 'User', 'Notification', 'Log'],
  endpoints: (builder) => ({
    getJobs: builder.query<any[], void>({
      query: () => '/jobs',
      providesTags: ['Job'],
    }),
    getAuditLogs: builder.query<any[], void>({
      query: () => '/audit-logs',
      providesTags: ['Log'],
    }),
    searchJobs: builder.query<any[], string>({
      query: (term) => `/jobs?search=${term}`,
      providesTags: ['Job'],
    }),
    createJob: builder.mutation<any, Partial<any>>({
      query: (body) => ({ url: '/jobs', method: 'POST', body }),
      invalidatesTags: ['Job'],
    }),
    updateJob: builder.mutation<any, { id: string; body: Partial<any> }>({
      query: ({ id, body }) => ({ url: `/jobs/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Job'],
    }),
    deleteJob: builder.mutation<any, string>({
      query: (id) => ({ url: `/jobs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Job'],
    }),
    getScreening: builder.query<any, string>({
      query: (jobId) => `/screening/job/${jobId}`,
      providesTags: ['Screening'],
    }),
    getStats: builder.query<any, void>({
      query: () => '/stats',
      providesTags: ['Job', 'Applicant', 'Screening'],
    }),
    runScreening: builder.mutation<any, string>({
      query: (jobId) => ({ url: '/screening/run', method: 'POST', body: { jobId } }),
      invalidatesTags: ['Screening', 'Notification'],
    }),
    getApplicants: builder.query<any[], string>({
      query: (jobId) => `/applicants/job/${jobId}`,
      providesTags: ['Applicant'],
    }),
    getCRMApplicants: builder.query<any[], void>({
      query: () => '/applicants',
      providesTags: ['Applicant'],
    }),
    createApplicant: builder.mutation<any, Partial<any>>({
      query: (body) => ({ url: '/applicants', method: 'POST', body }),
      invalidatesTags: ['Applicant', 'Notification'],
    }),
    updateApplicantStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/applicants/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Applicant'],
    }),
    bulkUploadApplicants: builder.mutation<any, { jobId: string; applicants: any[] }>({
      query: (body) => ({ url: '/applicants/bulk', method: 'POST', body }),
      invalidatesTags: ['Applicant'],
    }),
    getUsers: builder.query<any[], void>({
      query: () => '/users',
      providesTags: ['User' as any],
    }),
    createRecruiter: builder.mutation<any, { email: string; password: string; role?: string }>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User' as any],
    }),
    deleteRecruiter: builder.mutation<any, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User' as any],
    }),
    getBatchStatus: builder.query<any[], void>({
      query: () => '/users/batch-status',
      providesTags: ['Job', 'Screening'],
    }),
    getNotifications: builder.query<any[], string | null>({
      query: (role) => `/notifications${role ? `?role=${role}` : ''}`,
      providesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({ url: '/notifications/mark-all-read', method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    login: builder.mutation<any, any>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    register: builder.mutation<any, any>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<any, any>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    verifyEmail: builder.mutation<any, any>({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
    }),
    googleLogin: builder.mutation<any, any>({
      query: (body) => ({ url: '/auth/google-login', method: 'POST', body }),
    }),
    getMyApplications: builder.query<any[], void>({
      query: () => '/applicants/my',
      providesTags: ['Applicant'],
    }),
    withdrawApplication: builder.mutation<any, string>({
      query: (id) => ({
        url: `/applicants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Applicant'],
    }),
    uploadResume: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/upload/resume',
        method: 'POST',
        body: formData,
      }),
    }),
    markNotificationRead: builder.mutation<any, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Notification'],
    }),
    updateApplicant: builder.mutation<any, { id: string; body: Partial<any> }>({
      query: ({ id, body }) => ({ url: `/applicants/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Applicant'],
    }),
    sendMessage: builder.mutation<any, { email: string; message: string; name: string; subject?: string }>({
      query: (body) => ({ url: '/communication/send', method: 'POST', body }),
    }),
    bulkUpdateApplicantStatus: builder.mutation<any, { ids: string[]; status: string }>({
      query: (body) => ({ url: '/applicants/bulk-status', method: 'PATCH', body }),
      invalidatesTags: ['Applicant'],
    }),
    transcribeApplicant: builder.mutation<any, string>({
      query: (id) => ({ url: `/applicants/${id}/transcribe`, method: 'POST' }),
      invalidatesTags: ['Applicant'],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useSearchJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useGetScreeningQuery,
  useGetStatsQuery,
  useRunScreeningMutation,
  useGetApplicantsQuery,
  useGetCRMApplicantsQuery,
  useCreateApplicantMutation,
  useBulkUploadApplicantsMutation,
  useGetUsersQuery,
  useCreateRecruiterMutation,
  useDeleteRecruiterMutation,
  useGetBatchStatusQuery,
  useGetNotificationsQuery,
  useGetAuditLogsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useGoogleLoginMutation,
  useGetMyApplicationsQuery,
  useUpdateApplicantStatusMutation,
  useUpdateApplicantMutation,
  useSendMessageMutation,
  useBulkUpdateApplicantStatusMutation,
  useWithdrawApplicationMutation,
  useUploadResumeMutation,
  useTranscribeApplicantMutation,
} = api;
