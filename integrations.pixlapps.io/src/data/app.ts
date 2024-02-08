import { Routes } from '@/config/routes';
import { client } from '@/data/client/app';
import { GetQueryParams } from '@/types';
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
      Router.push(Routes.app.list);
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.APPS);
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
      queryClient.invalidateQueries(API_ENDPOINTS.APPS);
    },
  });
};

export const useUpdateMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(client.update, {
    onSuccess: async (data) => {
      Router.push(Routes.app.list);

      toast.success(t('common:successfully-updated'));
    },

    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.APPS);
    },
  });
};

export const useGetQuery = ({ id }: GetQueryParams) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.APPS, { id }],
    () => client.get({ id }),
    {
      keepPreviousData: true,
    },
  );

  return {
    app: data?.data ?? [],
    error,
    loading: isLoading,
  };
};

export const useGetsQuery = (options: Partial<any>) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.APPS, options],
    ({ queryKey, pageParam }) => client.getAllIntegrations(),
    {
      keepPreviousData: true,
    },
  );

  return {
    data: data?.data ?? [],
    paginatorInfo: data?.meta,
    error,
    loading: isLoading,
  };
};

export const useGetsAppListOptions = () => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.APPS, 'Options'],
    ({ queryKey, pageParam }) => client.getAppOptions(),
    {
      keepPreviousData: true,
    },
  );

  return {
    data: data?.data ?? [],
    paginatorInfo: data?.meta,
    error,
    loading: isLoading,
  };
};

export const useGetsSitesQuery = (options: Partial<any>) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    ['/webclow', options],
    ({ queryKey, pageParam }) =>
      client.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    },
  );

  return {
    data: data?.data ?? [],
    paginatorInfo: data?.meta,
    error,
    loading: isLoading,
  };
};
