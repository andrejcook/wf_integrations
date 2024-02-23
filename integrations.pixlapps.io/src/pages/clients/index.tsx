import List from '@/components/client/list';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import AppLayout from '@/components/layouts/app';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import { Routes } from '@/config/routes';
import { useGetsQuery } from '@/data/clients';
import { SortOrder } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { data, loading, error } = useGetsQuery({});

  if (loading) return <Loader text={'Loading...'} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={'Clients'} />
        </div>{' '}
        <div className="flex justify-end w-full flex-col items-center space-y-4 ms-auto md:w-3/4 md:flex-row md:space-y-0 xl:w-2/4">
          <LinkButton
            href={`${Routes.clients.create}`}
            className="h-12 w-full md:w-auto md:ms-6 float-right"
          >
            <span className="block md:hidden xl:block">
              {t('form:button-label-add-new')}
            </span>
            <span className="hidden md:block xl:hidden">
              {t('form:button-label-add')}
            </span>
          </LinkButton>
        </div>
      </Card>

      {loading ? null : (
        <List
          data={data}
          paginatorInfo={null}
          onPagination={handlePagination}
          onOrder={setOrder}
          onSort={setColumn}
        />
      )}
    </>
  );
}

Page.Layout = AppLayout;
export default Page;
