import { Routes } from '@/config/routes';
import { client } from '@/data/client/flow';
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
      Router.push(Routes.flow.list);
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.FLOWS);
    },
  });
};

export const useClearSnapShot = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(client.clearSnpShot, {
    onSuccess: async (data) => {
      Router.push(Routes.flow.list);

      toast.success('Snapshot clear successfully');
    },

    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.FLOWS);
    },
  });
};

export const useStartStopFlow = () => {
  const queryClient = useQueryClient();
  return useMutation(client.useStartStopFlow, {
    onSuccess: async (data: any) => {
      toast.success(`Flow has been successfully ${data.status}`);
    },

    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.FLOWS);
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
      queryClient.invalidateQueries(API_ENDPOINTS.FLOWS);
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
      queryClient.invalidateQueries(API_ENDPOINTS.FLOWS);
    },
  });
};

export const useGetQuery = ({ id }: GetQueryParams) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.FLOWS, { id }],
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

export const useGetAllQuery = () => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.FLOWS],
    ({ queryKey, pageParam }) => client.getAllFlow(),
    {
      keepPreviousData: true,
      refetchInterval: 10000,
    },
  );

  return {
    data: data?.data ?? [],
    paginatorInfo: data?.meta,
    error,
    loading: isLoading,
  };
};

export const useGetFlowSummery = () => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.FLOWS],
    ({ queryKey, pageParam }) => client.getFlowSummery(),
    {
      keepPreviousData: true,
    },
  );

  return {
    data: data ?? {},
    paginatorInfo: data?.meta,
    error,
    loading: isLoading,
  };
};
