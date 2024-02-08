import { Routes } from '@/config/routes';
import { User } from '@/types';
import { setEmailVerified } from '@/utils/auth-utils';
import { AUTH_CRED } from '@/utils/constants';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';
import { userClient } from './client/user';

export const useMeQuery = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useQuery<User, Error>([API_ENDPOINTS.ME], userClient.me, {
    retry: false,

    onSuccess: () => {},

    onError: (err) => {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 417) {
          router.replace(Routes.login);
          return;
        }

        if (err.response?.status === 409) {
          setEmailVerified(false);
          router.replace(Routes.login);
          return;
        }
        queryClient.clear();
        router.replace(Routes.login);
      }
    },
  });
};

export function useLogin() {
  return useMutation(userClient.login);
}

export const useLogoutMutation = () => {
  const router = useRouter();
  const { t } = useTranslation();
  Cookies.remove(AUTH_CRED);
  router.replace(Routes.login);
  toast.success(t('common:successfully-logout'), {
    toastId: 'logoutSuccess',
  });
};

export const useUserQuery = ({ id }: { id: string }) => {
  return useQuery<User, Error>(
    [API_ENDPOINTS.USERS, id],
    () => userClient.fetchUser({ id }),
    {
      enabled: Boolean(id),
    },
  );
};
