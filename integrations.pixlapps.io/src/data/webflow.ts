import { Routes } from '@/config/routes';
import { client } from '@/data/client/webflow';
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
export const useGetsSites = (credentialId: number) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.SITES, credentialId],
    ({ queryKey, pageParam }) => client.getSite(credentialId),
    {
      keepPreviousData: true,
      enabled: credentialId > 0,
    },
  );

  return {
    data: data ?? [],
    error,
    loading: isLoading,
  };
};
export const useGetURLResponse = (enableFeatch: boolean, url: string) => {
  console.log(enableFeatch);
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.getData, url],
    ({ queryKey, pageParam }) =>
      client.getData(`${encodeURIComponent(`${url}`)}`),
    {
      keepPreviousData: true,
      enabled: enableFeatch && url !== undefined && url !== null,
    },
  );
  return {
    data: data ?? [],
    error,
    loading: isLoading,
  };
};
export const useGetsCollections = (credentialId: number, siteId: string) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.SITE_COLLECTIONS, credentialId, siteId],
    ({ queryKey, pageParam }) =>
      client.getCollectionBySiteId(credentialId, siteId),
    {
      keepPreviousData: true,
      enabled: credentialId > 0 && siteId != undefined,
    },
  );

  return {
    data: data ?? [],
    error,
    loading: isLoading,
  };
};

export const useGetsCollection = (
  credentialId: number,
  collectionId: string,
) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.SITE_COLLECTION, credentialId, collectionId],
    ({ queryKey, pageParam }) =>
      client.getCollectionById(credentialId, collectionId),
    {
      keepPreviousData: true,
      enabled: credentialId > 0 && collectionId != undefined,
    },
  );

  return {
    data: data ?? undefined,
    error,
    loading: isLoading,
  };
};
