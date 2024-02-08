import CreateOrUpdateForm from '@/components/flow/create-update-form';
import Layout from '@/components/layouts/app';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function CreatePage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex border-b border-dashed border-gray-300 pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:button-label-add-new')}
        </h1>
      </div>
      <CreateOrUpdateForm />
    </>
  );
}

CreatePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
