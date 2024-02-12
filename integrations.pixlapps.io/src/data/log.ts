import { Routes } from '@/config/routes';
import { client } from '@/data/client/log';
import { GetQueryParams, QueryOptions } from '@/types';
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';

export const useCreateMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(client.create, {
    onSuccess: () => {
      Router.push(Routes.flow.list);
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.INTEGRATION_LOGS);
    },
  });
};

export const useDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(client.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.INTEGRATION_LOGS);
    },
  });
};

export const useUpdateMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(client.update, {
    onSuccess: async (data) => {
      Router.push(Routes.flow.list);

      toast.success(t('common:successfully-updated'));
    },

    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.INTEGRATION_LOGS);
    },
  });
};

export const useGetByIdQuery = (id: number) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.INTEGRATION_LOGS, { id }],
    () => client.getById(id),
    {
      keepPreviousData: true,
      enabled: id > 0,

    },
  );

  return {
    data: data?.data ?? [],
    error,
    loading: isLoading,
  };
};

export const useGetAllQuery = (params: Partial<QueryOptions>) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.INTEGRATION_LOGS, params],
    ({ queryKey, pageParam }) =>
      client.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    },
  );

  return {
    data: data?.data ?? [],
    paginatorInfo: data?.meta?.pagination,
    error,
    loading: isLoading,
  };
};
