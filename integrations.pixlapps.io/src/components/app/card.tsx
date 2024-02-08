// import { useTranslation } from 'next-i18next';
import Link from '@/components/ui/link';
// import Badge from '@/components/ui/badge/badge';
import { App } from '@/types';
import classNames from 'classnames';
import { isNumber } from 'lodash';
// import { useShopQuery } from '@/data/shop';
import { Routes } from '@/config/routes';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { Fragment } from 'react';
import { MoreIcon } from '../icons/more-icon';
type Props = {
  data: App;
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

const Card: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <div
        className={classNames('relative flex h-22 justify-end overflow-hidden')}
      >
        <div className="flex justify-end p-2">
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
                  'shadow-700 absolute z-50 overflow-hidden rounded border border-border-200 bg-light  focus:outline-none ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left',
                )}
              >
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={Routes.app.edit(data?.id as string)}
                      className={classNames(
                        'flex w-full items-center space-x-3 px-5 py-2.5 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-none rtl:space-x-reverse',
                        active ? 'text-accent' : 'text-body',
                      )}
                    >
                      <span className="whitespace-nowrap">
                        {t('common:text-edit')}
                      </span>
                    </Link>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      <div className="relative z-10 -mt-[4.25rem] ml-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-[calc(100%-104px)] flex-auto pr-4 pt-2">
          {data?.name ? (
            <Link href={Routes.app.edit(data?.id as string)}>
              <h3 className="text-base font-medium leading-none text-muted-black">
                {data?.name}
              </h3>
            </Link>
          ) : (
            ''
          )}
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-4 divide-x divide-[#E7E7E7] px-2 pb-7 text-center">
        <li>
          <ListItem
            title={t('text-title-integration')}
            info={data?.integration_flows?.length as number}
          />
        </li>
        <li>
          <ListItem
            title={t('text-title-credentials')}
            info={data?.app_credentials?.length as number}
          />
        </li>
      </ul>
    </div>
  );
};

export default Card;
