import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Label from '../ui/label';
import Loader from '../ui/loader/loader';

interface UrlContentFetcherProps {
  url: string;
  onURLChange: any;
}

const UrlContentFetcher: React.FC<UrlContentFetcherProps> = ({
  url,
  onURLChange,
}) => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await axios({
          method: 'get',
          url: `https://integrationapi.pixlapps.io/api/getData/${encodeURIComponent(url)}`,
        });

        setContent(response.data);
        onURLChange(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Error fetching content');
      }
    };

    if (url) fetchContent();
  }, [url]);

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
export default UrlContentFetcher;
