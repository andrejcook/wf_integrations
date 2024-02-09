import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import NotFound from '@/components/ui/not-found';
import { Routes } from '@/config/routes';
import { useGetsQuery } from '@/data/app';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import Modal from '../ui/modal/modal';
import Card from './card';
import TagDeleteView from './delete-view';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalComponent: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <TagDeleteView id={1} closeModal={onClose} />
    </Modal>
  );
};

const List = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useGetsQuery({});

  const [isModalOpen, setModalOpen] = useState(true);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  if (loading) return <Loader text={'Loading...'} />;
  if (error) return <ErrorMessage message={error.message} />;
  return (
    <>
      <div className="mb-5 border-b border-dashed border-border-base pb-5 md:mb-8 md:pb-7 ">
        <h1 className="text-lg font-semibold text-heading">
          {t('common:sidebar-nav-item-my-apps')}{' '}
          <LinkButton
            href={`${Routes.app.create}`}
            className="h-12 w-full md:w-auto md:ms-6 float-right"
          >
            <span className="block md:hidden xl:block">
              {t('form:button-label-add-app')}
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
          text="text-no-data-found"
          className="mx-auto w-7/12"
        />

      ) : null}
    </>
  );
};

export default List;
