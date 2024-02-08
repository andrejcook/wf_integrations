import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { useGetsAppListOptions } from '@/data/app';
import { useCreateMutation, useUpdateMutation } from '@/data/app-credentials';
import { getErrorMessage } from '@/utils/form-error';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Label from '../ui/label';
import SelectInput from '../ui/select-input';

import { openSignInWindow } from '@/lib/oauth-window';
import ValidationError from '../ui/form-validation-error';
import { appValidationSchema } from './validation-schema';

type FormValues = {
  name: string;
  app: {
    id: number;
    client_id: string;
    scope: any;
  };
};

const defaultValues = {};

type IProps = {
  initialValues?: any;
};

export default function CreateOrUpdateForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
        }
      : defaultValues,
    //@ts-ignore
    resolver: yupResolver(appValidationSchema),
  });
  const {
    data: appOptionsData,
    loading: appOptionsLoading,
    error: appOptionsError,
  } = useGetsAppListOptions();
  const { mutate: create, isLoading: creating } = useCreateMutation();
  const { mutate: update, isLoading: updating } = useUpdateMutation();

  const callBackURL = (values: FormValues, json: any) => {
    const queryParams = new URLSearchParams(json.params);
    const codeValue = queryParams.get('code');
    if (values && codeValue && codeValue !== 'undefined') {
      const input = {
        data: {
          appId: values.app.id,
          name: values.name,
          code: codeValue,
        },
      };
      try {
        if (!initialValues) {
          create({
            ...input,
            ...(initialValues?.slug && { slug: initialValues.slug }),
          });
        } else {
          update({
            ...input,
            id: initialValues.id!,
          });
        }
      } catch (err) {
        getErrorMessage(err);
      }
    } else {
      toast.error('Error in processing your request');
    }
  };

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    const authorizationUrl = `https://webflow.com/oauth/authorize?response_type=code&client_id=${
      values.app.client_id
    }&scope=${encodeURIComponent(values.app.scope.split(',').join(' '))}`;
    openSignInWindow(authorizationUrl, 'OAuth', callBackURL, values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={`Description`}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } your details and necessary information from here`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />
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
              disabled={initialValues}
            />

            <ValidationError message={errors?.app?.message} />
          </div>
        </Card>
      </div>
      <StickyFooterPanel className="z-0">
        <div className="text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="text-sm me-4 md:text-base"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}

          <Button
            loading={creating || updating}
            disabled={creating || updating}
            className="text-sm md:text-base"
          >
            {initialValues
              ? 'Update and Regenerate Credential'
              : 'Add New Credential'}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
