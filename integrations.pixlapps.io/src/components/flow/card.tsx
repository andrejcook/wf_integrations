// import { useTranslation } from 'next-i18next';
// import Badge from '@/components/ui/badge/badge';
import { App } from '@/types';
import classNames from 'classnames';
import { isNumber } from 'lodash';
// import { useShopQuery } from '@/data/shop';
import { MoreIcon } from '@/components/icons/more-icon';
import { Routes } from '@/config/routes';
import { useClearSnapShot, useStartStopFlow } from '@/data/flow';
import { getErrorMessage } from '@/utils/form-error';
import { Menu, Transition } from '@headlessui/react';
import cronstrue from 'cronstrue';
import moment from 'moment';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { EditFillIcon } from '../icons/edit';
import Badge from '../ui/badge/badge';
import Button from '../ui/button';
type FlowCardProps = {
  data: App;
  setCurrentDeleteModelState: any;
};

export const ListItem = ({ title, info }: { title: string; info: number }) => {
  return (
    <>
      {isNumber(info) ? (
        <p className="text-sm font-semibold text-muted-black">{Number(info)}</p>
      ) : (
        ''
      )}
      {title ? <p className="text-xs text-[#666]">{title}</p> : ''}
    </>
  );
};

const Card: React.FC<FlowCardProps> = ({
  data,
  setCurrentDeleteModelState,
}: any) => {
  const router = useRouter();
  console.log(data);
  const cronInterval = (cron: string) => {
    try {
      return cronstrue.toString(cron);
    } catch (err) {
      return '';
    }
  };

  function onEdit() {
    router.push(Routes.flow.edit(data?.id as string));
  }

  function onCopy() {
    router.push(Routes.flow.copy(data?.id as string));
  }

  function onDelete() {
    if (setCurrentDeleteModelState) {
      setCurrentDeleteModelState({
        show: true,
        action: 'delete',
        props: data?.id,
      });
    }
  }

  const { mutate: clearSnapShot, isLoading: clearSnapShotLoading } =
    useClearSnapShot();
  const { mutate: startStopFLow, isLoading: startFlowLoading } =
    useStartStopFlow();
  const handelClearSnapshot = async (id: string) => {
    try {
      clearSnapShot({
        id: id!,
      });
    } catch (err) {
      getErrorMessage(err);
    }
  };
  const handelStartFlow = async (id: string) => {
    try {
      startStopFLow({
        id: id!,
      });
    } catch (err) {
      getErrorMessage(err);
    }
  };

  return (
    <div
      className={`p-4  border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ${
        data.integration_flow_detail.status === 'Terminated'
          ? 'border-2 border-red-700 bg-pink-100'
          : 'bg-white'
      }`}
    >
      <div style={{ position: 'absolute' }}>
        <Badge
          className="absolute top-[-10px] left-[-10px] bg-white border border-solid border-gray-300 rounded-2xl"
          animate={data.integration_flow_detail.status === 'Running'}
          textKey={data.integration_flow_detail.status}
          color={
            data.integration_flow_detail.status === 'Sleeping'
              ? 'text-yellow-600'
              : data.integration_flow_detail.status === 'Running'
              ? 'text-accent'
              : 'text-status-failed'
          }
        />
      </div>
      <div className="flex justify-end">
        <Menu
          as="div"
          className="relative inline-block ltr:text-left rtl:text-right"
        >
          <Menu.Button className="">
            <MoreIcon className="w-3.5 text-body" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              as="ul"
              className={classNames(
                'shadow-700 absolute z-50  rounded border border-border-200 bg-light  focus:outline-none ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left',
              )}
            >
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handelClearSnapshot(data?.id)}
                    className={classNames(
                      'flex w-full items-center space-x-3 px-5 py-1 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-none rtl:space-x-reverse',
                      active ? 'text-accent' : 'text-body',
                    )}
                  >
                    <span className="whitespace-nowrap">
                      {'Clear Snapshot'}
                    </span>
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onCopy()}
                    className={classNames(
                      'flex w-full items-center space-x-3 px-5 py-1 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-none rtl:space-x-reverse',
                      active ? 'text-accent' : 'text-body',
                    )}
                  >
                    <span className="whitespace-nowrap">{'Copy'}</span>
                  </button>
                )}
              </Menu.Item>
              {(data.integration_flow_detail.status === 'Stopped' ||
                data.integration_flow_detail.status === 'Terminated') && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onEdit}
                        className={classNames(
                          'flex w-full items-center space-x-3 px-5 py-1 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-none rtl:space-x-reverse',
                          active ? 'text-accent' : 'text-body',
                        )}
                      >
                        <span className="whitespace-nowrap">{'Edit'}</span>
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onDelete}
                        className={classNames(
                          'flex w-full items-center space-x-3 px-5 py-1 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-none rtl:space-x-reverse',
                          active ? 'text-accent' : 'text-body',
                        )}
                      >
                        <span className="whitespace-nowrap">{'Delete'}</span>
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <a href="#">
        <h5 className="mb-2 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
          {data.name}
        </h5>
      </a>
      {data.integration_flow_detail.last_run_date && (
        <p className="text-sm mb-1  text-gray-700 dark:text-gray-400">
          Last Run :{' '}
          {moment(data.integration_flow_detail.last_run_date).fromNow()}
        </p>
      )}
      {(data.integration_flow_detail.status === 'Running' ||
        data.integration_flow_detail.status === 'Sleeping') &&
        data.integration_flow_detail.next_run_date && (
          <p className="text-sm mb-1  text-gray-700 dark:text-gray-400">
            Next Run :{' '}
            {moment(data.integration_flow_detail.next_run_date).fromNow()}
          </p>
        )}
      <p className="text-sm mb-1 text-gray-700 dark:text-gray-400">
        Interval: {cronInterval(data.cron)}
      </p>

      <div className="flex space-x-4 py-2">
        <Button
          variant="outline"
          onClick={onEdit}
          type="button"
          disabled={
            data.integration_flow_detail.status !== 'Stopped' &&
            data.integration_flow_detail.status !== 'Terminated'
          }
        >
          <EditFillIcon />
          {'Edit'}
        </Button>

        {(data.integration_flow_detail.status === 'Running' ||
          data.integration_flow_detail.status === 'Sleeping') && (
          <Button
            disabled={startFlowLoading}
            loading={startFlowLoading}
            variant="custom"
            onClick={() => handelStartFlow(data?.id)}
            className="flex items-center justify-center  bg-red-500 text-white rounded-md"
            type="button"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="8" height="8" x="8" y="8" strokeWidth="8"></rect>
            </svg>
            {'Stop'}
          </Button>
        )}

        {(data.integration_flow_detail.status === 'Stopped' ||
          data.integration_flow_detail.status === 'Terminated') && (
          <Button
            disabled={startFlowLoading}
            loading={startFlowLoading}
            variant="custom"
            onClick={() => handelStartFlow(data?.id)}
            className="flex items-center justify-center px-4 py-2 bg-accent text-white rounded-md"
            type="button"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 4l15 8-15 8V4z"
              ></path>
            </svg>
            {'Run'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Card;
