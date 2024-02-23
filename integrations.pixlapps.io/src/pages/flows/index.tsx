import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import List from '@/components/flow/list';
import AppLayout from '@/components/layouts/app';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import Select from '@/components/ui/select/select';
import { Routes } from '@/config/routes';
import { useGetsOptionsQuery } from '@/data/clients';
import { useGetAllQuery } from '@/data/flow';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
const Apps = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const [orderBy, setOrder] = useState('id');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const {
    data: clientOptionsData,
    loading: clientOptionsLoading,
    error: clientOptionsError,
  } = useGetsOptionsQuery({});

  const {
    data: data,
    loading,
    error,
    paginatorInfo,
  } = useGetAllQuery({
    limit: 9,
    page,
    search: searchTerm,
    orderBy,
    sortedBy,
    clientSearchTerm: clientSearchTerm,
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
          <PageHeading title={t('common:sidebar-nav-item-integrations')} />
        </div>{' '}
        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-2/4">
          <Search placeholderText="Search" onSearch={handleSearch} />

          <div className="ms-5  w-[250px]">
            <Select
              name={`client`}
              getOptionLabel={(option: any) => {
                return `${option.name}`;
              }}
              isLoading={clientOptionsLoading}
              getOptionValue={(option: any) => {
                return option.id;
              }}
              options={clientOptionsData}
              isClearable={true}
              placeholder={'Client'}
              onChange={(obj: any) => setClientSearchTerm(obj?.id)}
            />
          </div>
        </div>
        <LinkButton
          href={`${Routes.flow.create}`}
          className="h-12 w-full md:w-auto md:ms-6 float-right"
        >
          <span className="block md:hidden xl:block">
            {t('form:button-label-add-new')}
          </span>
          <span className="hidden md:block xl:hidden">
            {t('form:button-label-add')}
          </span>
        </LinkButton>
      </Card>

      {loading ? null : (
        <List
          data={data}
          paginatorInfo={paginatorInfo}
          onPagination={handlePagination}
          onOrder={setOrder}
          onSort={setColumn}
        />
      )}
    </>
  );
};

Apps.Layout = AppLayout;
export default Apps;
