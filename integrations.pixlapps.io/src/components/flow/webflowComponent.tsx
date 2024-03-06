import Card from '@/components/common/card';
import { useGetsQuery as useGetsAppQuery } from '@/data/app';
import { useGetsQueryByAppId as useGetsCredentialQueryByAppId } from '@/data/app-credentials';
import {
  useGetsCollection,
  useGetsCollections,
  useGetsSites,
} from '@/data/webflow';
import { useEffect, useState } from 'react';
import {
  Controller,
  UseFormRegister,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import Description from '../ui/description';
import ValidationError from '../ui/form-validation-error';
import Label from '../ui/label';
import SelectInput from '../ui/select-input';

import MonacoEditor from '@monaco-editor/react';
import { FieldMapping, FormValues } from './formType';

import jsonata from 'jsonata';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';
import AutoSuggestInput from '../ui/autoSuggust';
import Input from '../ui/input';

interface JsonData {
  [key: string]: any;
}
function areKeysEqual(obj1: any, obj2: any) {
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  return (
    keys1.length === keys2.length && keys1.every((key) => keys2.includes(key))
  );
}
function isDate(value: any) {
  try {
    const date = new Date(value);
    return date.toISOString() != '';
  } catch {
    return false;
  }
}
function findDatetimeFields(obj1: any): { field: string }[] {
  const datetimeFields: { field: string }[] = [];
  let obj = {};
  if (Array.isArray(obj1)) {
    obj = obj1[0];
  } else {
    obj = obj1;
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      try {
        // Use Date.parse to convert the string to a timestamp
        const datetimeMoment = isDate(value);
        if (datetimeMoment) {
          datetimeFields.push({ field: key });
        }
      } catch (error) {
        // Ignore errors if parsing fails
      }
    }
  }

  return datetimeFields;
}

async function convertToTypeScriptString(
  input: Record<string, string>,
  previewObject: any,
): Promise<string> {
  const jsonString = JSON.stringify(input, null, 2);

  const resultString = await Promise.all(
    jsonString.match(/"([^"]+)":\s*"([^"]*)"/g)?.map(async (match) => {
      const [_, key, value] = match.match(/"([^"]+)":\s*"([^"]*)"/) || [];

      if (key && value) {
        const isAsyncInclude = await asyncIncludes(key, value, previewObject);

        return `"${key}": ${isAsyncInclude ? `${value}` : `"${value}"`}`;
      }
      return match;
    }) || [],
  );

  return `{${resultString.join(',\n')} }`;
}

// Example async include function
async function asyncIncludes(
  key: string,
  value: string,
  previewObject: any,
): Promise<boolean> {
  try {
    let expressionDataTest = `{ "${key}": ${value} }`;
    const expressionObjData = jsonata(expressionDataTest, {
      recover: true,
    });
    const result = await expressionObjData.evaluate(previewObject);
    if (Object.keys(result).length === 0) {
      if (value.includes('.')) {
        return true;
      }

      return false;
    } else {
      return true;
    }
  } catch (error) {}
  return false;
}

function getAllKeys(obj: JsonData): string[] {
  const keys: string[] = [];

  function extractKeys(obj: JsonData, currentPath: string[] = []) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newPath = [...currentPath, key];
        if (newPath.length === 1) {
          let path = newPath[0];
          if (typeof obj[path] === 'string' || typeof obj[path] === 'number') {
            keys.push(path);
          }
        }

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractKeys(obj[key], newPath);
        }
      }
    }
  }

  extractKeys(obj);
  return keys;
}
function getValueByKey(obj: any, targetKey: string): any | null {
  const keys = targetKey.split('.');
  let currentObject = obj;
  if (Array.isArray(obj)) {
    for (const key of keys) {
      if (
        currentObject &&
        typeof currentObject === 'object' &&
        key in currentObject
      ) {
        currentObject = currentObject[key];
      } else {
        return undefined;
      }
    }
  } else {
    keys.shift();
    if (keys.length === 0) {
      return obj;
    }

    for (const key of keys) {
      if (
        currentObject &&
        typeof currentObject === 'object' &&
        key in currentObject
      ) {
        currentObject = currentObject[key];
      } else {
        return undefined;
      }
    }
  }

  return currentObject;
}
function sortObjectKeysAlphabetically(obj: any) {
  return obj.sort((a: any, b: any) => a.slug.localeCompare(b.slug));
}
interface Props {
  register: UseFormRegister<FormValues>;
  errors: any;
  control: any;
  apiResponse: any;
  setValue: any;
  isDirty: boolean;
}

const WebflowComponent: React.FC<Props> = ({
  register,
  errors,
  control,
  apiResponse,
  setValue,
  isDirty,
}) => {
  const fieldPrefix = 'steps.step2';
  const errorField = errors?.steps?.step2;
  const app = useWatch({
    control,
    name: `app`,
  });

  const credential = useWatch({
    control,
    name: `app_credential`,
  });

  const site = useWatch({
    control,
    name: `${fieldPrefix}.site`,
  });

  const collection = useWatch({
    control,
    name: `${fieldPrefix}.collection`,
  });

  const {
    data: appOptionsData,
    loading: appOptionsLoading,
    error: appOptionsError,
  } = useGetsAppQuery({});

  const {
    data: credentialOptionsData,
    loading: credentialOptionsLoading,
    error: credentialOptionsError,
  } = useGetsCredentialQueryByAppId(app?.id || 0);

  const {
    data: siteOptionsData,
    loading: siteOptionsLoading,
    error: siteOptionsError,
  } = useGetsSites(credential?.id || 0);

  const {
    data: collectionsData,
    loading: collectionsLoading,
    error: collectionsError,
  } = useGetsCollections(credential?.id, site?.id);

  const {
    data: collectionDetailData,
    loading: collectionDetailLoading,
    error: collectionDetailError,
  } = useGetsCollection(credential?.id, collection?.id);

  return (
    <div>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={'Webflow'}
          details={` Select the information`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{'Select App'}</Label>
            <SelectInput
              name={`app`}
              control={control}
              getOptionLabel={(option: any) => {
                return `${option.name}`;
              }}
              isLoading={appOptionsLoading}
              getOptionValue={(option: any) => {
                return option.id;
              }}
              isCloseMenuOnSelect={false}
              options={appOptionsData}
            />

            <ValidationError message={errors?.app?.message} />
          </div>

          <div className="mb-5">
            <Label>{'Select App Credential'}</Label>
            <SelectInput
              name={`app_credential`}
              control={control}
              isLoading={credentialOptionsLoading}
              getOptionLabel={(option: any) => {
                return `${option.name}`;
              }}
              getOptionValue={(option: any) => option.id}
              isCloseMenuOnSelect={false}
              options={credentialOptionsData}
            />

            <ValidationError message={errors?.app_credential?.message} />
          </div>
          <div className="mb-5">
            <Label>{'Select Site'}</Label>
            <SelectInput
              name={`${fieldPrefix}.site`}
              control={control}
              isLoading={siteOptionsLoading}
              getOptionLabel={(option: any) => {
                return option.displayName;
              }}
              getOptionValue={(option: any) => option.id}
              isCloseMenuOnSelect={false}
              options={siteOptionsData}
            />

            <ValidationError message={errorField?.site?.message} />
          </div>

          <div className="mb-5">
            <Label>{'Select CMS'}</Label>
            <SelectInput
              name={`${fieldPrefix}.collection`}
              control={control}
              isLoading={collectionsLoading}
              getOptionLabel={(option: any) => {
                return `${option.displayName}`;
              }}
              getOptionValue={(option: any) => option.id}
              isCloseMenuOnSelect={false}
              options={collectionsData}
            />

            <ValidationError message={errorField?.collection?.message} />
          </div>
        </Card>
      </div>
      {apiResponse && collectionDetailData && (
        <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
          <h2>Field Mapper</h2> <hr />
          <Card className="w-full ">
            <AdvancedFieldMapping
              lhsData={apiResponse}
              rhsData={collectionDetailData}
              control={control}
              register={register}
              setFormValue={setValue}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

const AdvancedFieldMapping = (fieldMapping: FieldMapping) => {
  const {
    control,
    register,
    formState: { isDirty, dirtyFields, errors },
  } = useFormContext<FormValues>();
  const { t } = useTranslation();

  const editorRef = useRef<any>(null);
  const editorRef1 = useRef<any>(null);
  const [evalute, setEvaluate] = useState<any>('');
  const [advancedFieldMapping, setAdvancedFieldMapping] =
    useState<boolean>(false);

  let arrayKeysArray: any = [];

  if (fieldMapping.lhsData) {
    if (Array.isArray(fieldMapping.lhsData)) {
      // Process array of objects
      arrayKeysArray = fieldMapping.lhsData
        .map((event) => Object.keys(event))
        .flat()
        .filter(
          (key, index, self) =>
            self.indexOf(key) === index &&
            Array.isArray(fieldMapping.lhsData[0][key]),
        )
        .map((key) => ({ value: `0.${key}.0`, label: key }));
    } else if (typeof fieldMapping.lhsData === 'object') {
      // Process single object
      arrayKeysArray = Object.keys(fieldMapping.lhsData)
        .filter((key) => Array.isArray(fieldMapping.lhsData[key]))
        .map((key) => ({ value: `0.${key}.0`, label: key }));
    }
  }

  const arrayKeysArrayoptions = [
    { value: '0', label: 'root' },
    ...arrayKeysArray,
  ];

  const splitter = useWatch({
    control: fieldMapping.control,
    name: `steps.splitter`,
  });

  const collection = useWatch({
    control: fieldMapping.control,
    name: `steps.step2.collection`,
  });

  const mapFields = useWatch({
    control: fieldMapping.control,
    name: `steps.mapFields`,
  });

  const ref_key_field = useWatch({
    control: fieldMapping.control,
    name: `ref_key_field`,
  });

  const previewObject = getValueByKey(fieldMapping.lhsData, splitter.value);

  const rhsFields =
    (fieldMapping &&
      fieldMapping.rhsData &&
      sortObjectKeysAlphabetically(
        fieldMapping.rhsData?.fields?.filter(
          (element: { slug: string }) => element.slug !== 'slug',
        ),
      )) ||
    [];

  const refFields =
    (fieldMapping &&
      fieldMapping.rhsData &&
      fieldMapping.rhsData?.fields
        ?.filter(
          (element: { slug: string; type: string }) =>
            element.slug !== 'slug' &&
            (element.type === 'PlainText' || element.type === 'Number'),
        )
        .map((element: any) => {
          return {
            value: element.slug,
            label: element.displayName,
          };
        })) ||
    [];

  const [expression, setExpression] = useState<string>();
  useEffect(() => {
    if (rhsFields && collection) {
      const slugsObject: { [key: string]: string } = {};
      rhsFields.forEach((item: any) => {
        slugsObject[item.slug] = (mapFields && mapFields[item.slug]) ?? '';
      });

      if (!areKeysEqual(slugsObject, mapFields)) {
        const exists = refFields.some(
          (item: any) => item.value === ref_key_field?.value,
        );
        if (!exists) fieldMapping.setFormValue('ref_key_field', null);
        fieldMapping.setFormValue('steps.mapFields', slugsObject);
        setExpression(JSON.stringify(slugsObject, null, 2));
      }
    }
  }, [rhsFields, collection]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (expression) {
          const expressionObj = jsonata(expression, {
            recover: true,
          });
          const result = await expressionObj.evaluate(previewObject);
          setEvaluate(result);
          fieldMapping.setFormValue('steps.expression', expression);
        }
      } catch (error) {
        setEvaluate(error);

        console.error('Error evaluating JSONata expression:', error);
      }
    };

    if (previewObject) fetchData();

    return () => {};
  }, [expression, previewObject]);

  const handleEvaluate = async () => {
    setExpression(editorRef?.current?.getValue());
  };

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  function handleEditorDidMount1(editor: any, monaco: any) {
    editorRef1.current = editor;
  }

  const items = (previewObject && getAllKeys(previewObject)) || [];

  useEffect(() => {
    const evaluteCurrentValue = async () => {
      const expressionData = await convertToTypeScriptString(
        mapFields,
        previewObject,
      );
      try {
        if (expressionData) {
          setExpression(expressionData);
        }
      } catch (error) {}
    };
    if (mapFields) evaluteCurrentValue();
  }, [mapFields]);

  return (
    <div>
      <div className="flex justify-end relative ">
        <button
          onClick={() => setAdvancedFieldMapping(!advancedFieldMapping)}
          type="button"
          style={{ right: '-30px', top: '-20px' }}
          className="text-blue-700 absolute hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          {advancedFieldMapping ? 'Basic' : 'Advanced'}
        </button>
      </div>
      <div className="flex">
        <div className="w-1/2 flex">
          <div className="w-1/2 p-2">
            {arrayKeysArrayoptions && (
              <div className="mb-5">
                <Label>{'Select Splitter'}</Label>
                <SelectInput
                  name="steps.splitter"
                  control={fieldMapping.control}
                  isCloseMenuOnSelect={false}
                  options={arrayKeysArrayoptions}
                />
              </div>
            )}{' '}
          </div>
          <div className="w-1/2 p-2">
            {refFields && (
              <div className="mb-5">
                <Label>{'Select Refrence Key'}</Label>
                <SelectInput
                  name={`ref_key_field`}
                  control={control}
                  isCloseMenuOnSelect={false}
                  options={refFields}
                />{' '}
                <ValidationError message={t(errors?.ref_key_field?.message)} />
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2 flex">
          <div className="w-1/2 p-2">
            <Input
              label={'Snap Shot Field'}
              {...register('snapshot_field')}
              variant="outline"
              className="mb-5"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="flex">
          <div className="w-1/2">
            <div className="h-1/2  border ">
              <MonacoEditor
                height="250px"
                language="json"
                theme="vs-dark"
                value={JSON.stringify(previewObject, null, 2)}
                onMount={handleEditorDidMount1}
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
            </div>
            <div className="h-1/2 bg-gray-500 border ">
              <MonacoEditor
                height="250px"
                language="json"
                theme="vs-dark"
                value={JSON.stringify(evalute, null, 2)}
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
            </div>
          </div>{' '}
          <div className="w-1/2 border ">
            {advancedFieldMapping && (
              <MonacoEditor
                height="500px"
                language="javascript"
                theme="vs-dark"
                value={expression}
                onMount={handleEditorDidMount}
                onChange={handleEvaluate}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'off',
                  contextmenu: false,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  extraEditorClassName: 'editor-pane',
                }}
              />
            )}
            {!advancedFieldMapping && (
              <div
                className="p-4"
                style={{ maxHeight: '550px', overflow: 'auto' }}
              >
                <div>
                  <MappingFieldUI
                    control={fieldMapping.control}
                    defaultValues={rhsFields}
                    items={items}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
function MappingFieldUI({ control, defaultValues, items }: any) {
  return (
    <ul className=" divide-y divide-gray-200">
      {defaultValues.map((item: any, index: number) => (
        <li key={item.id} className="p-4">
          <div className="flex items-center ">
            <div className="w-1/2">
              <p className="text-sm font-medium text-gray-900 truncate">
                <label htmlFor={item.id}>{item.displayName}</label>
              </p>
              <p className="text-sm text-gray-500 truncate ">
                {`${item.slug} (${item.type})`}
              </p>
            </div>
            <div className="w-1/2">
              <div>
                <Controller
                  name={`steps.mapFields.${item.slug}`}
                  control={control}
                  defaultValue="" // Provide a default value if needed
                  render={({ field }) => (
                    <AutoSuggestInput
                      {...field}
                      list={items} // Pass your list of options
                      onChange={(selected) => field.onChange(selected)}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default WebflowComponent;
