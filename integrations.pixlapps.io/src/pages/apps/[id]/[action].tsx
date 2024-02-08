import CreateOrUpdateForm from '@/components/app/create-update-form';
import Layout from '@/components/layouts/app';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useGetQuery } from '@/data/app';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function UpdateTagPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { app, loading, error } = useGetQuery({
    id: query.id as string,
  });

  if (loading) return <Loader text={'Loading...'} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex border-b border-dashed border-gray-300 py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">{'Update App'}</h1>
      </div>

      <CreateOrUpdateForm initialValues={app} />
    </>
  );
}

UpdateTagPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
