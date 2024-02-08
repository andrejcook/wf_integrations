import ConfirmationCard from '@/components/common/confirmation-card';
import { useDeleteMutation } from '@/data/app';
import { getErrorMessage } from '@/utils/form-error';

interface ModalProps {
  id: number;
  closeModal: () => void;
}

const DeleteView: React.FC<ModalProps> = ({ closeModal, id }) => {
  const { mutate: deleteTagById, isLoading: loading } = useDeleteMutation();

  function handleDelete() {
    try {
      deleteTagById({ id: id.toString() });
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default DeleteView;
