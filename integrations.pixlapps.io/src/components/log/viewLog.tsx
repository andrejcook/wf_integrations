import { useGetByIdQuery } from '@/data/log';
import MonacoEditor from '@monaco-editor/react';
import Loader from '../ui/loader/loader';
import Modal from '../ui/modal/modal';

interface ModalProps {
  id: number;
  isOpen: boolean;
  closeModal: () => void;
}

const ViewLog: React.FC<ModalProps> = ({ closeModal, id, isOpen }) => {
  const { data, loading } = useGetByIdQuery(id);
  return (
    <Modal open={isOpen} onClose={closeModal}>
      <div className="m-auto w-full rounded-md bg-light p-4 pb-6 sm:w-[50rem] md:rounded-xl">
        <div className="h-full w-full">
          <div className="flex h-full flex-col">
            {loading && <Loader text={'Loading...'} />}
            {data &&
              data.details &&
              data.details.created &&
              data.details.created.length > 0 && (
                <>
                  <p className="py-2 px-6 leading-relaxed text-body-dark dark:text-muted">
                    <h3>Created</h3>
                    <MonacoEditor
                      height="250px"
                      language="json"
                      theme="vs-dark"
                      value={JSON.stringify(data.details.created, null, 2)}
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: 'off',
                        contextmenu: false,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        extraEditorClassName: 'editor-pane',
                        readOnly: true,
                      }}
                    />
                  </p>
                </>
              )}

            {data &&
              data.details &&
              data.details.updated &&
              data.details.updated.length > 0 && (
                <>
                  <p className="py-2 px-6 leading-relaxed text-body-dark dark:text-muted">
                    <h3>Updated</h3>

                    <MonacoEditor
                      height="250px"
                      language="json"
                      theme="vs-dark"
                      value={JSON.stringify(data.details.updated, null, 2)}
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: 'off',
                        contextmenu: false,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        extraEditorClassName: 'editor-pane',
                        readOnly: true,
                      }}
                    />
                  </p>
                </>
              )}

            {data &&
              data.details &&
              data.details.failed &&
              data.details.failed.length > 0 && (
                <>
                  <p className="py-2 px-6 leading-relaxed text-body-dark dark:text-muted">
                    {' '}
                    <h3>Failed</h3>
                    <MonacoEditor
                      height="250px"
                      language="json"
                      theme="vs-dark"
                      value={JSON.stringify(data.details.failed, null, 2)}
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: 'off',
                        contextmenu: false,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        extraEditorClassName: 'editor-pane',
                        readOnly: true,
                      }}
                    />
                  </p>
                </>
              )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewLog;
