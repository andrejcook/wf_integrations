import { Routes } from '@/config/routes';
import { client } from '@/data/client/clients';
import { GetQueryParams } from '@/types';
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';

const App_Routes = Routes.clients;
const ENDPOINTS = API_ENDPOINTS.CLIENTS;

export const useCreateMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(client.create, {
    onSuccess: () => {
      Router.push(App_Routes.list);
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(ENDPOINTS);
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
    onSettled: () => {
      queryClient.invalidateQueries(ENDPOINTS);
    },
  });
};

export const useUpdateMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(client.update, {
    onSuccess: async (data) => {
      Router.push(App_Routes.list);

      toast.success(t('common:successfully-updated'));
    },

    onSettled: () => {
      queryClient.invalidateQueries(ENDPOINTS);
    },
  });
};

export const useGetQuery = ({ id }: GetQueryParams) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [ENDPOINTS, { id }],
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
    [ENDPOINTS, options],
    ({ queryKey, pageParam }) => client.getAllWithChild(),
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

export const useGetsOptionsQuery = (options: Partial<any>) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [ENDPOINTS, options],
    ({ queryKey, pageParam }) => client.getOptions(),
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
