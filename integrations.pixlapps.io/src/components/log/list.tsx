import ActionButtons from '@/components/common/action-buttons';
import { NoDataFound } from '@/components/icons/no-data-found';
import Badge from '@/components/ui/badge/badge';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import { Log, SortOrder } from '@/types';
import { useIsRTL } from '@/utils/locals';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import TitleWithSort from '../ui/title-with-sort';
function padTo2Digits(num: any) {
  return num.toString().padStart(2, '0');
}

function convertMsToTime(milliseconds: any) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  // 👇️ If you don't want to roll hours over, e.g. 24 to 00
  // 👇️ comment (or remove) the line below
  // commenting next line gets you `24:00:00` instead of `00:00:00`
  // or `36:15:31` instead of `12:15:31`, etc.
  hours = hours % 24;

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
    seconds,
  )}`;
}
type IProps = {
  logs: Log[] | undefined;
  paginatorInfo: any | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};
const List = ({
  logs,
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

  function onEdit(id: string) {
    router.push(Routes.flow.edit(id));
  }
  const columns = [
    {
      title: (
        <TitleWithSort
          title={'id'}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'id'
          }
          isActive={sortingObj.column === 'id'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 60,
      onHeaderCell: () => onHeaderClick('id'),
      render: (id: number) => id,
    },
    {
      title: (
        <TitleWithSort
          title={'Integration Flow'}
          ascending={
            sortingObj.sort === SortOrder.Asc &&
            sortingObj.column === 'integration_flow.name'
          }
          isActive={sortingObj.column === 'integration_flow.name'}
        />
      ),
      key: 'integration_flow.name',
      align: alignLeft,
      width: 150,
      className: 'cursor-pointer',
      onHeaderCell: () => onHeaderClick('integration_flow.name'),
      render: (text: any, record: any) => {
        return record?.integration_flow?.name;
      },
    },
    {
      title: 'Start Date',
      className: 'cursor-pointer',
      dataIndex: 'start_date',
      key: 'start_date',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('start_date'),
      render: (start_date: any) => moment(start_date).format('LLLL'),
    },
    {
      title: 'End Date',
      className: 'cursor-pointer',
      dataIndex: 'end_date',
      key: 'end_date',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('end_date'),
      render: (end_date: any) => moment(end_date).format('LLLL'),
    },
    {
      title: 'Duration',
      key: 'duration',
      align: alignLeft,
      width: 150,
      className: 'cursor-pointer',
      render: (
        text: any,
        record: {
          start_date: Date;
          end_date: Date;
        },
      ) => {
        const startDate: any = new Date(record.start_date);
        const endDate: any = new Date(record.end_date);
        const durationInMilliseconds = endDate - startDate;

        return convertMsToTime(durationInMilliseconds);
      },
    },
    {
      title: 'Data Sync',
      className: 'cursor-pointer',
      dataIndex: 'dataSync',
      key: 'dataSync',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('dataSync'),
      render: (dataSync: number) => dataSync,
    },
    {
      title: 'Status',
      width: 150,
      className: 'cursor-pointer',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      onHeaderCell: () => onHeaderClick('status'),
      render: (status: string) => (
        <Badge
          textKey={status}
          color={
            status === 'Completed'
              ? 'bg-accent/10 !text-accent'
              : 'bg-status-failed/10 text-status-failed'
          }
        />
      ),
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
              viewAction={true}
              callback={() => console.log('callback')}
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
          data={logs}
          rowKey="id"
          scroll={{ y: 400 }}
        />
      </div>

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
