import Card from '@/components/common/card';
import { useGetsQuery as useGetsAppQuery } from '@/data/app';
import { useGetsQueryByAppId as useGetsCredentialQueryByAppId } from '@/data/app-credentials';
import { useGetsCollections, useGetsSites } from '@/data/webflow';
import { useWatch } from 'react-hook-form';
import Description from '../ui/description';
import ValidationError from '../ui/form-validation-error';
import Label from '../ui/label';
import SelectInput from '../ui/select-input';

interface Props {
  errors: any;
  control: any;
}

const WebflowComponent: React.FC<Props> = ({ errors, control }) => {
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
    </div>
  );
};

export default WebflowComponent;
