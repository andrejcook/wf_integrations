import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import NotFound from '@/components/ui/not-found';
import { Routes } from '@/config/routes';
import { useGetAllQuery } from '@/data/flow';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import Card from './card';

const List = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useGetAllQuery();

  if (loading) return <Loader text={'Loading...'} />;
  if (error) return <ErrorMessage message={error.message} />;
  return (
    <>
      <div className="mb-5 border-b border-dashed border-border-base pb-5 md:mb-8 md:pb-7 ">
        <h1 className="text-lg font-semibold text-heading">
          {t('common:sidebar-nav-item-integrations')}{' '}
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
        </h1>
      </div>
      {!isEmpty(data) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data?.map((item: any, idx: number) => (
            <Card data={item} key={idx} />
          ))}
        </div>
      ) : (
        ''
      )}
      {isEmpty(data) ? (
        <NotFound
          image="/no-shop-found.svg"
          text="text-no-data-found"
          className="mx-auto w-7/12"
        />
      ) : null}
    </>
  );
};

export default List;
