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
import DeleteView from './delete-view';
const BASE_URL = process.env.NEXT_PUBLIC_REST_BASE_ENDPOINT ?? '';

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

  const [currentDeleteModelState, setCurrentDeleteModelState] = useState<any>({
    show: false,
  });

  function actionCallback(action: string, record: any) {
    if (action === 'edit') router.push(Routes.clients.edit(record.id));
    if (action === 'delete') {
      setCurrentDeleteModelState({
        show: true,
        action: 'delete',
        props: record,
      });
    }
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
      title: 'Logo',
      key: 'logo',
      align: alignLeft,
      width: 150,
      className: 'cursor-pointer',
      render: (text: any, record: any) => {
        return (
          <img
            width={'30px'}
            src={`${BASE_URL}${record?.logo?.url}`}
            alt={record.name}
          />
        );
      },
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 120,
      render: function Render(id: string, record: any) {
        return (
          <>
            <ActionButtons
              props={record}
              editAction={true}
              deleteAction={true}
              callback={actionCallback}
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      {currentDeleteModelState.show && (
        <DeleteView
          data={currentDeleteModelState.props.integration_flows}
          id={currentDeleteModelState.props.id}
          isOpen={currentDeleteModelState.show}
          closeModal={() => setCurrentDeleteModelState({ show: false })}
        />
      )}
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
