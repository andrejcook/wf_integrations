import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import Description from '../ui/description';
import ValidationError from '../ui/form-validation-error';
import Label from '../ui/label';
import SelectInput from '../ui/select-input';
import { RAPIDAPI_TRIGGER } from './formType';
import UrlContentFetcher from './urlContentFetcher';

interface Props {
  register: any;
  errors: any;
  control: any;
  setValue: any;
  setApiResponse: any;
}
const NEXT_PUBLIC_X_RapidAPI_Key = process.env.NEXT_PUBLIC_X_RapidAPI_Key ?? '';

const RAPID_API_INSTAGRAM = 'https://instagram-data1.p.rapidapi.com';
const HEADERS = {
  'X-RapidAPI-Key': NEXT_PUBLIC_X_RapidAPI_Key,
  'X-RapidAPI-Host': 'instagram-data1.p.rapidapi.com',
};

const RapidApiComponent: React.FC<Props> = ({
  register,
  errors,
  control,
  setValue,
  setApiResponse,
}) => {
  const fieldPrefix = 'steps.step1';
  const errorField = errors?.steps?.step1;
  const [groups, setGroups] = useState<any>([]);
  const [groupFetchError, setGroupFetchError] = useState<string>();

  const username = useWatch({
    control,
    name: `${fieldPrefix}.username`,
  });

  const apiURL = useWatch({
    control,
    name: `${fieldPrefix}.apiURL`,
  });

  const trigger = useWatch({
    control,
    name: `${fieldPrefix}.trigger`,
  });
  const limit = useWatch({
    control,
    name: `${fieldPrefix}.limit`,
  });

  useEffect(() => {
    // Define the debounce function
    const debounceSearch = setTimeout(() => {
      const setURL = () => {
        let URL = `${RAPID_API_INSTAGRAM}`;

        if (trigger && trigger.value) {
          URL = URL + trigger.value;
        }

        if (username) {
          URL = URL + `?username=${username}`;
        }

        if (limit) {
          URL = URL + `&limit=${limit}`;
        }
        setValue(`${fieldPrefix}.headers`, HEADERS);
        setValue(`${fieldPrefix}.apiURL`, URL);
      };
      setValue(`${fieldPrefix}.apiURL`, null);
      console.log(username);
      if (username && trigger) setURL();
    }, 600); // Adjust the debounce delay (in milliseconds) as needed

    return () => clearTimeout(debounceSearch);
  }, [trigger, username, limit]);

  return (
    <>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={'API Details'}
          details={`Select the API and trigger and enter the username`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{'Select Trigger'}</Label>
            <SelectInput
              name={`${fieldPrefix}.trigger`}
              control={control}
              isCloseMenuOnSelect={false}
              options={RAPIDAPI_TRIGGER}
            />
            <ValidationError message={errorField?.trigger?.message} />
          </div>
          <div className="mb-5">
            <Input
              label={'User Name'}
              {...register(`${fieldPrefix}.username`)}
              error={errorField?.username?.message}
              variant="outline"
              className="mt-5"
            />
            <ValidationError message={groupFetchError} />
          </div>
          <div className="mb-5">
            <Input
              label={'limit'}
              {...register(`${fieldPrefix}.limit`)}
              error={errorField?.limit?.message}
              variant="outline"
              className="mt-5"
              type="number"
              defaultValue={16}
              max={50}
              min={0}
            />
            <ValidationError message={groupFetchError} />
          </div>

          <>
            <div>
              {trigger && username && apiURL && (
                <UrlContentFetcher
                  headers={HEADERS}
                  key={`url1`}
                  url={apiURL}
                  onURLChange={setApiResponse}
                />
              )}
            </div>
          </>
        </Card>
      </div>
    </>
  );
};

export default RapidApiComponent;
