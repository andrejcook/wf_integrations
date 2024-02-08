import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';

import { useCreateMutation, useUpdateMutation } from '@/data/flow';
import { getErrorMessage } from '@/utils/form-error';
import { yupResolver } from '@hookform/resolvers/yup';
import { COMPONENT, FormValues, IProps } from './formType';

import cronstrue from 'cronstrue';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Description from '../ui/description';
import ValidationError from '../ui/form-validation-error';
import Label from '../ui/label';
import SelectInput from '../ui/select-input';
import RestAPIComponent from './restApiComponent';
import TixerConfig from './tixerComponent';
import { appValidationSchema } from './validation-schema';
import WebflowComponent from './webflowComponent';

const defaultValues = {
  cron: '*/5 * * * *',
  steps: {
    splitter: { value: '0', label: 'root' },
  },
};

function CreateOrUpdateForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const methods = useForm<FormValues>({
    mode: 'all', // Validation will trigger onBlur event
    reValidateMode: 'onChange', //
    defaultValues: initialValues
      ? {
          ...initialValues,
          integrationType: {
            value: initialValues.integrationType,
            label: initialValues.integrationType,
          },
          ref_key_field: {
            value: initialValues.ref_key_field,
            label: initialValues.ref_key_field,
          },
        }
      : defaultValues,
    //@ts-ignore
    resolver: yupResolver(appValidationSchema),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isDirty, errors },
  } = methods;

  const { mutate: create, isLoading: creating } = useCreateMutation();
  const { mutate: update, isLoading: updating } = useUpdateMutation();

  const onSubmit = async (values: FormValues) => {
    const input = {
      data: {
        name: values.name,
        cron: values.cron,
        steps: values.steps,
        integrationType: values.integrationType.value,
        app: values.app.id,
        app_credential: values.app_credential,
        ref_key_field: values.ref_key_field?.value,
        snapshot_field: values.snapshot_field,
      },
    };
    try {
      if (!initialValues) {
        create({
          ...input,
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
  };
  const [apiResponse, setApiResponse] = useState<any>([]);

  const cron = useWatch({
    control,
    name: `cron`,
  });

  const integrationType = useWatch({
    control,
    name: `integrationType`,
  });

  const [humanReadableText, setHumanReadableText] = useState('');

  useEffect(() => {
    try {
      const text = cronstrue.toString(cron);
      setHumanReadableText(text);
    } catch (error) {
      setHumanReadableText('');
    }
  }, [cron]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
          <Description
            title={`Integration Details`}
            details={`${
              initialValues
                ? t('form:item-description-edit')
                : t('form:item-description-add')
            } Integration name, cron expression and select the component`}
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
              <Input
                label={'Cron'}
                {...register('cron')}
                error={t(errors.cron?.message!)}
                variant="outline"
                className="mb-5"
              />
              {humanReadableText && (
                <label className="mb-3 block text-sm  success leading-none text-green-400	">
                  {humanReadableText}
                </label>
              )}
            </div>

            <div className="mb-5">
              <Label>{'Select Component'}</Label>
              <SelectInput
                name="integrationType"
                control={control}
                isCloseMenuOnSelect={false}
                options={COMPONENT}
              />
              <ValidationError message={t(errors?.integrationType?.message)} />
            </div>
          </Card>
        </div>

        {integrationType && (
          <>
            {integrationType && integrationType.value === 'tixer' && (
              <TixerConfig
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                setApiResponse={setApiResponse}
              />
            )}

            {integrationType && integrationType.value === 'restapi' && (
              <RestAPIComponent
                register={register}
                control={control}
                errors={errors}
                setApiResponse={setApiResponse}
              />
            )}
            {apiResponse && apiResponse.length > 0 && (
              <>
                <WebflowComponent
                  register={register}
                  control={control}
                  errors={errors}
                  apiResponse={apiResponse}
                  setValue={setValue}
                  isDirty={isDirty}
                />
              </>
            )}
          </>
        )}
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
                ? t('form:button-label-update-app')
                : t('form:button-label-add-app')}
            </Button>
          </div>
        </StickyFooterPanel>
      </form>
    </FormProvider>
  );
}

export default CreateOrUpdateForm;
