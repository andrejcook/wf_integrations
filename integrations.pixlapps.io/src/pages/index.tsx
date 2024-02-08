import AppLayout from '@/components/layouts/app';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import {
  allowedRoles,
  getAuthCredentials,
  hasAccess,
  isAuthenticated,
} from '@/utils/auth-utils';
import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/dashboard/admin'));

export default function Dashboard({
  userPermissions,
}: {
  userPermissions: string[];
}) {
  return <AdminDashboard />;
}

Dashboard.Layout = AppLayout;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx;
  // TODO: Improve it
  const generateRedirectUrl =
    locale !== Config.defaultLanguage
      ? `/${locale}${Routes.login}`
      : Routes.login;
  const { token, permissions } = getAuthCredentials(ctx);
  if (
    !isAuthenticated({ token, permissions }) ||
    !hasAccess(allowedRoles, permissions)
  ) {
    return {
      redirect: {
        destination: generateRedirectUrl,
        permanent: false,
      },
    };
  }
  if (locale) {
    return {
      props: {
        ...(await serverSideTranslations(locale, [
          'common',
          'form',
          'table',
          'widgets',
        ])),
        userPermissions: permissions,
      },
    };
  }
  return {
    props: {
      userPermissions: permissions,
    },
  };
};
