import ActionButtons from '@/components/common/action-buttons';
import { NoDataFound } from '@/components/icons/no-data-found';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import { SortOrder } from '@/types';
import { useIsRTL } from '@/utils/locals';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';

type IProps = {
  data: any | undefined;
  paginatorInfo: any;
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
  const { alignLeft } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: any | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const onHeaderClick = (column: any | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc
          ? SortOrder.Asc
          : SortOrder.Desc,
      );

      onOrder(column);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });
  const router = useRouter();

  function actionCallback(action: string, id: any) {
    if (action === 'edit') router.push(Routes.credentials.edit(id));
  }
  const columns = [
    {
      title: 'Id',
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 60,
      onHeaderCell: () => onHeaderClick('id'),
      render: (id: number) => id,
    },
    {
      title: 'Name',
      key: 'name',
      align: alignLeft,
      width: 150,
      className: 'cursor-pointer',
      render: (text: any, record: any) => {
        return record?.name;
      },
    },
    {
      title: 'App Name',
      key: 'name',
      align: alignLeft,
      width: 150,
      className: 'cursor-pointer',
      render: (text: any, record: any) => {
        return record?.app?.name;
      },
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 120,
      render: function Render(id: string, { is_active }: any) {
        return (
          <>
            <ActionButtons
              props={id}
              editAction={true}
              callback={actionCallback}
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          // @ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={data}
          rowKey="id"
          scroll={{ y: 400 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default List;
