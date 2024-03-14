import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { useCreateMutation, useUpdateMutation } from '@/data/clients';
import { getErrorMessage } from '@/utils/form-error';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Label from '../ui/label';

import FileInput from '../ui/file-input';
import ValidationError from '../ui/form-validation-error';
import { appValidationSchema } from './validation-schema';

type FormValues = {
  name: string;
  logo: {
    id: number;
  };
};

const defaultValues = { logo: null };

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

  const { mutate: create, isLoading: creating } = useCreateMutation();
  const { mutate: update, isLoading: updating } = useUpdateMutation();

  const onSubmit = async (values: FormValues) => {
    const input = {
      data: {
        logo: values.logo.id,
        name: values.name,
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
            <Label>{'Upload Logo'}</Label>
            <FileInput name="logo" control={control} multiple={false} />

            <ValidationError message={errors?.logo?.message} />
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
            {initialValues ? 'Update' : 'Add New'}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
