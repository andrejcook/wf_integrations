import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import NotFound from '@/components/ui/not-found';
import { Routes } from '@/config/routes';
import { useGetAllQuery } from '@/data/flow';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import Card from './card';
import Pagination from '../ui/pagination';

type IProps = {
  data: any | undefined;
  paginatorInfo: any | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const List = ({
  data,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-6 overflow-hidden rounded">

      {!isEmpty(data) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data?.map((item: any, idx: number) => (
            <Card data={item} key={idx} />
          ))}
        </div>
      ) : (
        ''
      )}
    </div>
      {isEmpty(data) ? (
        <NotFound
          text="text-no-data-found"
          className="mx-auto w-7/12"
        />
      ) : null}


    {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.page}
            pageSize={paginatorInfo.pageSize}
            onChange={onPagination}
            defaultPageSize={10}
            showSizeChanger
            showPrevNextJumpers={true}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      )}
    </>
  );
};

export default List;
