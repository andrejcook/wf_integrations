import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import AppLayout from '@/components/layouts/app';
import List from '@/components/log/list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useGetAllQuery } from '@/data/log';
import { SortOrder } from '@/types';
import { LIMIT } from '@/utils/constants';
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

  const [orderBy, setOrder] = useState('id');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const {
    data: logs,
    loading,
    error,
    paginatorInfo,
  } = useGetAllQuery({
    limit: LIMIT,
    page,
    search: searchTerm,
    orderBy,
    sortedBy,
  });

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
          <PageHeading title={'Logs'} />
        </div>{' '}
        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-2/4">
          <Search placeholderText="Search" onSearch={handleSearch} />
        </div>
      </Card>

      {loading ? null : (
        <List
          logs={logs}
          paginatorInfo={paginatorInfo}
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
