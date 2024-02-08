import AppList from '@/components/app/list';
import AppLayout from '@/components/layouts/app';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
const Apps = () => {
  return <AppList />;
};

Apps.Layout = AppLayout;
export default Apps;
