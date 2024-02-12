import { EditIcon } from '@/components/icons/edit';
import { Eye } from '@/components/icons/eye-icon';
import { TrashIcon } from '@/components/icons/trash';
import { useTranslation } from 'next-i18next';

type Props = {
  props: any;
  editAction?: boolean;
  viewAction?: boolean;
  deleteAction?: boolean;
  callback?: any;
};

const ActionButtons = ({
  props,
  editAction,
  viewAction,
  deleteAction,
  callback,
}: Props) => {
  const { t } = useTranslation();

  function handelCallback(action: string, actionProps?: any) {
    if (callback) callback(action, props, actionProps);
  }

  return (
    <div className="inline-flex w-auto items-center gap-3">
      {editAction && (
        <button
          onClick={() => handelCallback('edit')}
          className="text-body transition duration-200 hover:text-heading focus:outline-none"
          title={t('common:text-edit')}
        >
          <EditIcon width={16} />
        </button>
      )}

      {viewAction && (
        <>
          <button
            onClick={() => handelCallback('view')}
            className="text-body transition duration-200 hover:text-heading focus:outline-none"
            title={t('common:text-preview')}
          >
            {' '}
            <Eye width={18} />
          </button>
        </>
      )}

      {deleteAction && (
        <button
          onClick={() => handelCallback('delete')}
          className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
          title={t('common:text-delete')}
        >
          <TrashIcon width={14} />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
