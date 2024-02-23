import { useDeleteMutation } from '@/data/clients';
import { getErrorMessage } from '@/utils/form-error';
import ConfirmationCard from '../common/confirmation-card';
import Modal from '../ui/modal/modal';

interface ModalProps {
  id: number;
  isOpen: boolean;
  closeModal: () => void;
  data: any;
}

const DeleteView: React.FC<ModalProps> = ({ closeModal, id, isOpen, data }) => {
  const { mutate: deleteById, isLoading: loading } = useDeleteMutation();

  function handleDelete() {
    try {
      deleteById({ id: id.toString() });
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }
  return (
    <Modal open={isOpen} onClose={closeModal}>
      <>
        {(!data || data?.length === 0) && (
          <ConfirmationCard
            onCancel={closeModal}
            onDelete={handleDelete}
            deleteBtnLoading={loading}
          />
        )}
        {data && data?.length > 0 && (
          <div className="m-auto w-full max-w-sm rounded-md bg-light p-4 pb-6 sm:w-[24rem] md:rounded-xl">
            <div className="h-full w-full text-center">
              <div className="flex h-full flex-col justify-between">
                <p className="py-2 px-6 leading-relaxed text-body-dark dark:text-muted">
                  <>
                    Please remove the associated integration flows before
                    eliminating this client. It is currently utilized by
                    {` ${data?.length}`} integration flows.
                  </>
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    </Modal>
  );
};

export default DeleteView;
