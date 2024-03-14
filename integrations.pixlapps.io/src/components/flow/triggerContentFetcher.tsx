import { HttpClient } from '@/data/client/http-client';
import MonacoEditor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import Label from '../ui/label';
import Loader from '../ui/loader/loader';

interface TriggerContentFetcherProps {
  type: string;
  trigger: string;
  parameter: any;
  onURLChange: any;
}

const TriggerContentFetcher: React.FC<TriggerContentFetcherProps> = ({
  type,
  trigger,
  onURLChange,
  parameter,
}) => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const data = await HttpClient.post<any>('getTriggerResponse', {
          type: type,
          trigger: trigger,
          parameter: parameter,
        });

        setContent(data);
        onURLChange(data);
        setLoading(false);
      } catch (error) {
        onURLChange(undefined);
        setContent('');
        setLoading(false);
        setError('Error fetching content');
      }
    };

    if (type && trigger) fetchContent();
  }, [type, trigger, parameter]);

  return (
    <>
      {!loading && content && (
        <div className=" rounded-md">
          <Label>{'Response Data'}</Label>
          <pre className="whitespace-pre-wrap" style={{ fontSize: '12px' }}>
            <MonacoEditor
              height="300px"
              language="json"
              theme="vs-dark"
              value={JSON.stringify(content, null, 2)}
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
          </pre>
        </div>
      )}
      {loading && (
        <div className="mt-2 flex h-16 items-center ms-2 justify-center">
          <Loader simple={true} className="h-6 w-6" />
        </div>
      )}
    </>
  );
};
export default TriggerContentFetcher;
