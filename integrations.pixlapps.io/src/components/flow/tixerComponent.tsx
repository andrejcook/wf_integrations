import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { DatePicker } from '../ui/date-picker';
import Description from '../ui/description';
import ValidationError from '../ui/form-validation-error';
import Label from '../ui/label';
import SelectInput from '../ui/select-input';
import SwitchInput from '../ui/switch-input';
import UrlContentFetcher from './urlContentFetcher';

interface Props {
  register: any;
  errors: any;
  control: any;
  setValue: any;
  setApiResponse: any;
}
const TIXER_DOMAIN = 'https://www.tixr.com/v1/';
const GROUP_API = 'groups?cpk=';

export enum SyncType {
  Public = 'public',
  Private = 'private',
}

const category = [
  { value: '', label: 'all' },
  { value: 'BusinessEvent', label: 'BusinessEvent' },
  { value: 'ChildrensEvent', label: 'ChildrensEvent' },
  { value: 'ComedyEvent', label: 'ComedyEvent' },
  { value: 'DanceEvent', label: 'DanceEvent' },
  { value: 'DeliveryEvent', label: 'DeliveryEvent' },
  { value: 'EducationEvent', label: 'EducationEvent' },
  { value: 'Festival', label: 'Festival' },
  { value: 'FoodEvent', label: 'FoodEvent' },
  { value: 'LiteraryEvent', label: 'LiteraryEvent' },
  { value: 'MusicEvent', label: 'MusicEvent' },
  { value: 'PrivateEvent', label: 'PrivateEvent' },
  { value: 'PublicationEvent', label: 'PublicationEvent' },
  { value: 'SocialEvent', label: 'SocialEvent' },
  { value: 'SportsEvent', label: 'SportsEvent' },
  { value: 'SaleEvent ', label: 'SaleEvent ' },
  { value: 'TheaterEvent', label: 'TheaterEvent' },
  { value: 'UserInteraction ', label: 'UserInteraction ' },
  { value: 'VisualArtsEvent', label: 'VisualArtsEvent' },
];

const TixerComponent: React.FC<Props> = ({
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

  const auth_key = useWatch({
    control,
    name: `${fieldPrefix}.auth_key`,
  });
  const group = useWatch({
    control,
    name: `${fieldPrefix}.group`,
  });
  const apiURL = useWatch({
    control,
    name: `${fieldPrefix}.apiURL`,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `http://localhost:3001/api/getData/${encodeURIComponent(
            `${TIXER_DOMAIN}${GROUP_API}${auth_key}`,
          )}`,
        });

        if (response.data && response.data.length > 0) {
          setGroupFetchError('');
        } else {
          setGroupFetchError('No Group found');
        }
        setGroups(response.data);
      } catch (error) {
        setGroups([]);
        setGroupFetchError('Error fetching content');
      }
    };
    if (auth_key) fetchContent();
  }, [auth_key]);

  useEffect(() => {
    // Define the debounce function
    const debounceSearch = setTimeout(() => {
      const setURL = () => {
        setValue(
          `${fieldPrefix}.apiURL`,
          `${TIXER_DOMAIN}groups/${group?.id}/events?cpk=${auth_key}`,
        );
      };
      setValue(`${fieldPrefix}.apiURL`, null);
      if (group && group?.id) setURL();
    }, 600); // Adjust the debounce delay (in milliseconds) as needed

    return () => clearTimeout(debounceSearch);
  }, [group?.id]);

  return (
    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
      <Description
        title={'API Details'}
        details={`Add the Auth Key and select Group`}
        className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
      />
      <Card className="w-full sm:w-8/12 md:w-2/3">
        <div>
          <div className="flex items-center space-s-4">
            <SwitchInput name={`${fieldPrefix}.isStaging`} control={control} />
            <Label className="!mb-0.5">Staging API</Label>
          </div>
        </div>
        <Input
          label={'Auth Key'}
          {...register(`${fieldPrefix}.auth_key`)}
          error={errorField?.auth_key?.message}
          variant="outline"
          className="mt-5"
        />
        <ValidationError message={groupFetchError} />

        {groups && groups.length > 0 && (
          <>
            <div className="mb-5 mt-5">
              <Label>{'Select Group'}</Label>
              <SelectInput
                name={`${fieldPrefix}.group`}
                control={control}
                getOptionLabel={(option: any) => {
                  return `${option.name}`;
                }}
                getOptionValue={(option: any) => {
                  return option.id;
                }}
                isCloseMenuOnSelect={false}
                options={groups}
              />

              <ValidationError message={errorField?.group?.message} />
            </div>
            <div className="mb-5">
              <Label>{'Select event category type to filter'}</Label>
              <SelectInput
                name={`${fieldPrefix}.category`}
                control={control}
                isCloseMenuOnSelect={false}
                options={category}
              />

              <ValidationError message={errorField?.category?.message} />
            </div>
            <div className="mb-5">
              <div className="flex items-center space-s-4">
                <SwitchInput
                  name={`${fieldPrefix}.show_full_inventory`}
                  control={control}
                />
                <Label className="!mb-0.5">Show Full Inventory (TBD)</Label>
              </div>
            </div>
            <div className="flex flex-col mb-5 sm:flex-row">
              <div className="w-full p-0 mb-5 sm:mb-0 sm:w-1/2 sm:pe-2">
                <Label>{'Date'}</Label>

                <Controller
                  control={control}
                  name={`${fieldPrefix}.date`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      dateFormat="yyyy-MM-dd"
                      onChange={onChange}
                      onBlur={onBlur}
                      //@ts-ignore
                      selected={value}
                      selectsStart
                      startDate={new Date()}
                      className="border border-border-base"
                    />
                  )}
                />
                <ValidationError message={errorField?.date?.message} />
              </div>
              <div className="w-full p-0 sm:w-1/2 sm:ps-2">
                <Input
                  label={'Tag'}
                  {...register(`${fieldPrefix}.tag`)}
                  error={errorField?.tag?.message}
                  variant="outline"
                  className="mb-5"
                />
              </div>
            </div>
            <div className="flex flex-col mb-5 sm:flex-row">
              <div className="w-full p-0 mb-5 sm:mb-0 sm:w-1/2 sm:pe-2">
                <Label>{'Event Start Date'}</Label>

                <Controller
                  control={control}
                  name={`${fieldPrefix}.startDate`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      dateFormat="yyyy-MM-dd"
                      onChange={onChange}
                      onBlur={onBlur}
                      //@ts-ignore
                      selected={value}
                      selectsStart
                      startDate={new Date()}
                      className="border border-border-base"
                    />
                  )}
                />
                <ValidationError message={errorField?.startDate?.message!} />
              </div>
              <div className="w-full p-0 sm:w-1/2 sm:ps-2">
                <Label>{'Event End Date'}</Label>

                <Controller
                  control={control}
                  name={`${fieldPrefix}.endDate`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      dateFormat="yyyy-MM-dd"
                      onChange={onChange}
                      onBlur={onBlur}
                      //@ts-ignore
                      selected={value}
                      selectsEnd
                      startDate={new Date()}
                      className="border border-border-base"
                    />
                  )}
                />
                <ValidationError message={errorField?.endDate?.message!} />
              </div>
            </div>
            <div>
              {apiURL && (
                <UrlContentFetcher
                  key={`url1`}
                  url={apiURL}
                  onURLChange={setApiResponse}
                />
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TixerComponent;
