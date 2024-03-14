import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import { useGetSingleItem } from '@/data/webflow';
import { getCountries } from '@/lib/country';
import MonacoEditor from '@monaco-editor/react';
import jsonata from 'jsonata';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import Description from '../ui/description';
import ValidationError from '../ui/form-validation-error';
import Label from '../ui/label';
import SelectInput from '../ui/select-input';
import { SPOTIFY_API_TRIGGER } from './formType';
import TriggerContentFetcher from './triggerContentFetcher';

interface Props {
  register: any;
  errors: any;
  control: any;
  setValue: any;
  setApiResponse: any;
}

const SPOTIFY_TYPE_OPTION = [
  {
    label: 'type',
    options: [
      { value: 'album', label: 'album' },
      { value: 'artist', label: 'artist' },
      { value: 'playlist', label: 'playlist' },
      { value: 'track', label: 'track' },
      { value: 'show', label: 'show' },
      { value: 'episode', label: 'episode' },
      { value: 'audiobook', label: 'audiobook' },
    ],
  },
];

const INCLUDE_EXTERNAL_OPTION = [{ value: 'audio', label: 'audio' }];
function getKeys(arr: any) {
  // Check if input is an array and not empty
  if (!Array.isArray(arr) || arr.length === 0) {
    return '';
  }

  // Map the "value" property of each object in the array
  const values = arr.map((item) => item.value);

  // Join the values with commas and return as a string
  return values;
}
const defaultLimit = 2;
const SpotifyApiComponent: React.FC<Props> = ({
  register,
  errors,
  control,
  setValue,
  setApiResponse,
}) => {
  const fieldPrefix = 'steps.step1';
  const errorField = errors?.steps?.step1;
  const [parameter, setParameter] = useState<any>({});
  const [expressionResult, setExpressionResult] = useState<any>();
  const [expressionError, setExpressionError] = useState<any>();

  const action = useWatch({
    control,
    name: `${fieldPrefix}.action`,
  });
  const type = useWatch({
    control,
    name: `${fieldPrefix}.parameter.type`,
  });

  const query = useWatch({
    control,
    name: `${fieldPrefix}.parameter.query`,
  });

  const limit = useWatch({
    control,
    name: `${fieldPrefix}.parameter.limit`,
  });

  const market = useWatch({
    control,
    name: `${fieldPrefix}.parameter.market`,
  });

  const include_external = useWatch({
    control,
    name: `${fieldPrefix}.parameter.include_external`,
  });

  const credential = useWatch({
    control,
    name: `app_credential`,
  });

  const collection = useWatch({
    control,
    name: `steps.step2.collection`,
  });

  const {
    data: item,
    loading: itemLoading,
    error: collectionsError,
  } = useGetSingleItem(credential?.id, collection?.id);

  useEffect(() => {
    // Define the debounce function
    const debounceSearch = setTimeout(() => {
      const setParameterData = () => {
        setParameter({
          q: expressionResult ? encodeURIComponent(expressionResult) : '',
          limit: limit || defaultLimit,
          type: getKeys(type),
          market: (market && market.value) || '',
          include_external: (include_external && include_external.value) || '',
        });
      };
      if (type && action && type.length > 0 && expressionResult)
        setParameterData();
    }, 600); // Adjust the debounce delay (in milliseconds) as needed

    return () => clearTimeout(debounceSearch);
  }, [action, type, limit, query, include_external, market, expressionResult]);

  async function getExpressionResult(expression: any, data: any) {
    let result = '';
    try {
      const expressionObj = jsonata(expression, {
        recover: true,
      });
      result = await expressionObj.evaluate(data);
      if (!result) {
        setExpressionError('Please enter the valid query');
      } else {
        setExpressionError('');
      }
    } catch (ex: any) {
      console.log(ex);
      setExpressionError(ex?.message || '');
    }
    return result;
  }

  useEffect(() => {
    const evaluteCurrentValue = async () => {
      const expressionData = await getExpressionResult(query, item);
      if (typeof expressionData === 'string')
        setExpressionResult(expressionData);
      else setExpressionError('Please enter the valid query');
    };
    if (query && item) evaluteCurrentValue();
  }, [query, item]);

  return (
    <>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <>
          <Description
            title={'Spotify API Details'}
            details={
              item && (
                <>
                  {`Select the trigger`}
                  <pre
                    className="whitespace-pre-wrap"
                    style={{ fontSize: '12px' }}
                  >
                    <MonacoEditor
                      height="300px"
                      language="json"
                      theme="vs-dark"
                      value={JSON.stringify(item, null, 2)}
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
                </>
              )
            }
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />{' '}
        </>
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{'Select Action'}</Label>
            <SelectInput
              name={`${fieldPrefix}.action`}
              control={control}
              isCloseMenuOnSelect={false}
              options={SPOTIFY_API_TRIGGER}
              isClearable={true}
            />
            <ValidationError message={errorField?.parameter?.action?.message} />
          </div>
          {action && action.value && (
            <>
              <div className="mb-5">
                <Input
                  label={'Query'}
                  {...register(`${fieldPrefix}.parameter.query`)}
                  error={errorField?.query?.message}
                  variant="outline"
                  className="mt-5"
                />
                <ValidationError
                  message={errorField?.parameter?.query?.message}
                />
                {expressionError && (
                  <ValidationError message={expressionError} />
                )}
                {expressionResult && (
                  <label className="mb-3 block text-sm  success leading-none text-green-400	">
                    {expressionResult}
                  </label>
                )}
                <>
                  <p className="text-sm text-body">
                    The available filters are album, artist, track, year, upc,
                    tag:hipster, tag:new, isrc, and genre.
                  </p>
                  <p className="mt-2 text-sm text-body">
                    Example: remaster track:Doxy artist:Miles Davis
                  </p>
                </>
              </div>

              <div className="flex flex-col mb-5 sm:flex-row">
                <div className="w-full p-0 mb-5 sm:mb-0 sm:w-1/2 sm:pe-2">
                  <Label>{'Type'}</Label>
                  <SelectInput
                    name={`${fieldPrefix}.parameter.type`}
                    control={control}
                    getOptionLabel={(option: any) => {
                      return option.label
                        .split(':')
                        .join(' ')
                        .replace(/(?:^|\s)\S/g, function (a: any) {
                          return a.toUpperCase();
                        });
                    }}
                    isCloseMenuOnSelect={false}
                    options={SPOTIFY_TYPE_OPTION}
                    isMulti
                    isClearable={false}
                  />

                  <ValidationError
                    message={errorField?.parameter?.type?.message}
                  />
                </div>
                <div className="w-full p-0 sm:w-1/2 sm:ps-2">
                  <Label>{'Market'}</Label>
                  <SelectInput
                    name={`${fieldPrefix}.parameter.market`}
                    control={control}
                    isCloseMenuOnSelect={false}
                    options={getCountries()}
                    isClearable={true}
                  />
                  <ValidationError
                    message={errorField?.parameter?.market?.message}
                  />
                </div>
              </div>
              <div className="flex flex-col mb-5 sm:flex-row">
                <div className="w-full p-0 mb-5 sm:mb-0 sm:w-1/2 sm:pe-2">
                  <Label>{'Select include_external'}</Label>
                  <SelectInput
                    name={`${fieldPrefix}.parameter.include_external`}
                    control={control}
                    isCloseMenuOnSelect={false}
                    options={INCLUDE_EXTERNAL_OPTION}
                  />
                  <ValidationError
                    message={errorField?.parameter?.include_external?.message}
                  />
                </div>
                <div className="w-full p-0 sm:w-1/2 sm:ps-2">
                  <>
                    <Input
                      label={'limit'}
                      {...register(`${fieldPrefix}.parameter.limit`)}
                      error={errorField?.limit?.message}
                      variant="outline"
                      type="number"
                      defaultValue={defaultLimit}
                      max={50}
                      min={0}
                    />
                    <ValidationError
                      message={errorField?.parameter?.limit?.message}
                    />
                  </>
                </div>
              </div>

              <div>
                {type &&
                  type.length > 0 &&
                  expressionResult &&
                  parameter &&
                  parameter.q && (
                    <TriggerContentFetcher
                      type={'spotify'}
                      key={`TriggerContentFetcher`}
                      trigger={action.value}
                      parameter={parameter}
                      onURLChange={setApiResponse}
                    />
                  )}
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default SpotifyApiComponent;
