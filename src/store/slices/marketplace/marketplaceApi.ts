import { apiSlice } from '../../ApiSlice';
import type {
  Product,
  PaginatedResponse,
  PaginationParams,
  CreateProductPayload,
  UpdateProductPayload,
  SellerProfile,
  UpdateSellerProfilePayload,
  SellerApplication,
  Deal,
  AdminLog,
} from './types';

// ─── Helpers ───────────────────────────────────────────────────────────────

const buildPaginationParams = (params?: PaginationParams): string => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  return `page=${page}&limit=${limit}`;
};

// ─── API Slice Injection ───────────────────────────────────────────────────

export const marketplaceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── Public ─────────────────────────────────────────────────────────────

    getProducts: builder.query<PaginatedResponse<Product>, PaginationParams | void>({
      query: (params) => `marketplace/products?${buildPaginationParams(params ?? {})}`,
      providesTags: (result) => {
        // result.data is the Product[] array; guard against unexpected shapes
        const items = Array.isArray(result?.data) ? result.data : [];
        return [
          ...items.map(({ id }) => ({ type: 'Products' as const, id })),
          { type: 'Products', id: 'LIST' },
        ];
      },
    }),

    getProduct: builder.query<{ data: Product }, string>({
      query: (productId) => `marketplace/products/${productId}`,
      providesTags: (_result, _err, id) => [{ type: 'Products', id }],
    }),

    buyProduct: builder.mutation<any, string>({
      query: (productId) => ({
        url: `marketplace/products/${productId}/buy`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Deals', id: 'LIST' }],
    }),

    // ── Seller ─────────────────────────────────────────────────────────────

    applySeller: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'marketplace/seller/apply',
        method: 'POST',
        body: formData,
        // Don't set Content-Type; browser sets multipart boundary automatically
        formData: true,
      }),
      invalidatesTags: [{ type: 'Applications', id: 'MY_STATUS' }],
    }),

    getApplicationStatus: builder.query<{ data: SellerApplication }, void>({
      query: () => 'marketplace/seller/application/status',
      providesTags: [{ type: 'Applications', id: 'MY_STATUS' }],
    }),

    getSellerProfile: builder.query<{ data: SellerProfile }, void>({
      query: () => 'marketplace/seller/profile',
      providesTags: [{ type: 'SellerProfile', id: 'MINE' }],
    }),

    updateSellerProfile: builder.mutation<any, UpdateSellerProfilePayload>({
      query: (body) => ({
        url: 'marketplace/seller/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'SellerProfile', id: 'MINE' }],
    }),

    createProduct: builder.mutation<any, CreateProductPayload>({
      query: (body) => ({
        url: 'marketplace/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'SELLER_LIST' },
      ],
    }),

    updateProduct: builder.mutation<any, { productId: string; body: UpdateProductPayload }>({
      query: ({ productId, body }) => ({
        url: `marketplace/products/${productId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _err, { productId }) => [
        { type: 'Products', id: productId },
        { type: 'Products', id: 'SELLER_LIST' },
      ],
    }),

    deleteProduct: builder.mutation<any, string>({
      query: (productId) => ({
        url: `marketplace/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'SELLER_LIST' },
      ],
    }),

    getSellerProducts: builder.query<PaginatedResponse<Product>, PaginationParams | void>({
      query: (params) => `marketplace/seller/products?${buildPaginationParams(params ?? {})}`,
      providesTags: [{ type: 'Products', id: 'SELLER_LIST' }],
    }),

    getSellerDeals: builder.query<PaginatedResponse<Deal>, PaginationParams | void>({
      query: (params) => `marketplace/seller/deals?${buildPaginationParams(params ?? {})}`,
      providesTags: [{ type: 'Deals', id: 'ACTIVE' }],
    }),

    getDealHistory: builder.query<PaginatedResponse<Deal>, PaginationParams | void>({
      query: (params) => `marketplace/seller/deals/history?${buildPaginationParams(params ?? {})}`,
      providesTags: [{ type: 'Deals', id: 'HISTORY' }],
    }),

    // ── Admin ──────────────────────────────────────────────────────────────

    getPendingApplications: builder.query<PaginatedResponse<SellerApplication>, PaginationParams | void>({
      query: (params) => `marketplace/admin/applications?${buildPaginationParams(params ?? {})}`,
      providesTags: [{ type: 'Applications', id: 'LIST' }],
    }),

    getApplicationDetail: builder.query<{ data: SellerApplication }, string>({
      query: (applicationId) => `marketplace/admin/applications/${applicationId}`,
      providesTags: (_result, _err, id) => [{ type: 'Applications', id }],
    }),

    approveApplication: builder.mutation<any, string>({
      query: (applicationId) => ({
        url: `marketplace/admin/applications/${applicationId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Applications', id: 'LIST' },
        { type: 'Sellers', id: 'LIST' },
      ],
    }),

    declineApplication: builder.mutation<any, { applicationId: string; reason: string }>({
      query: ({ applicationId, reason }) => ({
        url: `marketplace/admin/applications/${applicationId}/decline`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [{ type: 'Applications', id: 'LIST' }],
    }),

    getSellers: builder.query<PaginatedResponse<SellerProfile>, PaginationParams | void>({
      query: (params) => `marketplace/admin/sellers?${buildPaginationParams(params ?? {})}`,
      providesTags: [{ type: 'Sellers', id: 'LIST' }],
    }),

    getSellerDetail: builder.query<{ data: SellerProfile }, string>({
      query: (sellerUserId) => `marketplace/admin/sellers/${sellerUserId}`,
      providesTags: (_result, _err, id) => [{ type: 'Sellers', id }],
    }),

    banSeller: builder.mutation<any, { sellerUserId: string; cause: string }>({
      query: ({ sellerUserId, cause }) => ({
        url: `marketplace/admin/sellers/${sellerUserId}/ban`,
        method: 'POST',
        body: { cause },
      }),
      invalidatesTags: (_result, _err, { sellerUserId }) => [
        { type: 'Sellers', id: 'LIST' },
        { type: 'Sellers', id: sellerUserId },
      ],
    }),

    unbanSeller: builder.mutation<any, string>({
      query: (sellerUserId) => ({
        url: `marketplace/admin/sellers/${sellerUserId}/unban`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Sellers', id: 'LIST' },
        { type: 'Sellers', id },
      ],
    }),

    suspendSeller: builder.mutation<any, { sellerUserId: string; cause: string }>({
      query: ({ sellerUserId, cause }) => ({
        url: `marketplace/admin/sellers/${sellerUserId}/suspend`,
        method: 'POST',
        body: { cause },
      }),
      invalidatesTags: (_result, _err, { sellerUserId }) => [
        { type: 'Sellers', id: 'LIST' },
        { type: 'Sellers', id: sellerUserId },
      ],
    }),

    unsuspendSeller: builder.mutation<any, string>({
      query: (sellerUserId) => ({
        url: `marketplace/admin/sellers/${sellerUserId}/unsuspend`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Sellers', id: 'LIST' },
        { type: 'Sellers', id },
      ],
    }),

    cancelDeal: builder.mutation<any, { transactionId: string; cause: string }>({
      query: ({ transactionId, cause }) => ({
        url: `marketplace/admin/deals/${transactionId}/cancel`,
        method: 'POST',
        body: { cause },
      }),
      invalidatesTags: [{ type: 'Deals', id: 'LIST' }],
    }),

    getAdminLogs: builder.query<PaginatedResponse<AdminLog>, PaginationParams | void>({
      query: (params) => {
        const page = (params as PaginationParams)?.page ?? 1;
        const limit = (params as PaginationParams)?.limit ?? 50;
        return `marketplace/admin/logs?page=${page}&limit=${limit}`;
      },
      providesTags: [{ type: 'AdminLogs', id: 'LIST' }],
    }),
  }),

  overrideExisting: false,
});

// ─── Exported Hooks ────────────────────────────────────────────────────────

export const {
  // Public
  useGetProductsQuery,
  useGetProductQuery,
  useBuyProductMutation,
  // Seller
  useApplySellerMutation,
  useGetApplicationStatusQuery,
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetSellerProductsQuery,
  useGetSellerDealsQuery,
  useGetDealHistoryQuery,
  // Admin
  useGetPendingApplicationsQuery,
  useGetApplicationDetailQuery,
  useApproveApplicationMutation,
  useDeclineApplicationMutation,
  useGetSellersQuery,
  useGetSellerDetailQuery,
  useBanSellerMutation,
  useUnbanSellerMutation,
  useSuspendSellerMutation,
  useUnsuspendSellerMutation,
  useCancelDealMutation,
  useGetAdminLogsQuery,
} = marketplaceApi;
