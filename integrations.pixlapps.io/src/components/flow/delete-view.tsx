import { useDeleteMutation } from '@/data/flow';
import { getErrorMessage } from '@/utils/form-error';
import ConfirmationCard from '../common/confirmation-card';
import Modal from '../ui/modal/modal';

interface ModalProps {
  id: number;
  isOpen: boolean;
  closeModal: () => void;
}

const DeleteView: React.FC<ModalProps> = ({ closeModal, id, isOpen }) => {
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
      <ConfirmationCard
        onCancel={closeModal}
        onDelete={handleDelete}
        deleteBtnLoading={loading}
      />
    </Modal>
  );
};

export default DeleteView;
