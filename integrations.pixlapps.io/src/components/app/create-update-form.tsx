import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import ValidationError from '@/components/ui/form-validation-error';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import TextArea from '@/components/ui/text-area';
import { useCreateMutation, useUpdateMutation } from '@/data/app';
import { openSignInWindow } from '@/lib/oauth-window';
import { getErrorMessage } from '@/utils/form-error';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { appValidationSchema } from './validation-schema';

const SCOPE_OPTION = [
  {
    label: 'Scope',
    options: [
      { value: 'assets:read', label: 'assets:read' },
      { value: 'assets:write', label: 'assets:write' },
      {
        value: 'authorized_user:read',
        label: 'authorized_user:read',
        isFixed: true,
      },
      { value: 'cms:read', label: 'cms:read', isFixed: true },
      { value: 'cms:write', label: 'cms:write', isFixed: true },
      { value: 'custom_code:read', label: 'custom_code:read' },
      { value: 'custom_code:write', label: 'custom_code:write' },
      { value: 'forms:read', label: 'forms:read' },
      { value: 'forms:write', label: 'forms:write' },
      { value: 'pages:read', label: 'pages:read' },
      { value: 'pages:write', label: 'pages:write' },
      { value: 'sites:read', label: 'sites:read', isFixed: true },
      { value: 'sites:write', label: 'sites:write' },
    ],
  },
];

type FormValues = {
  client_id: string;
  client_secret: string;
  scope: any;
  details: string;
};

const defaultValues = {
  scope: [
    {
      value: 'authorized_user:read',
      label: 'authorized_user:read',
      isFixed: true,
    },
    { value: 'cms:read', label: 'cms:read', isFixed: true },
    { value: 'cms:write', label: 'cms:write', isFixed: true },
    { value: 'sites:read', label: 'sites:read', isFixed: true },
  ],
};

type IProps = {
  initialValues?: any;
};

function convertToValueLabel(scopesString: string) {
  if (!scopesString) return '';
  const scopesArray = scopesString.split(',');
  const convertedScopes = scopesArray.map((scope: string) => {
    return {
      value: scope,
      label: scope,
    };
  });

  return convertedScopes;
}
//const selectedScopes = ['authorized_user:read', 'cms:read', 'cms:write', 'sites:read'];

//const convertedScopes = convertToValueLabel(selectedScopes);
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
          scope: initialValues.scope
            ? convertToValueLabel(initialValues.scope)
            : '',
        }
      : defaultValues,
    //@ts-ignore
    resolver: yupResolver(appValidationSchema),
  });

  const { mutate: create, isLoading: creating } = useCreateMutation();
  const { mutate: update, isLoading: updating } = useUpdateMutation();

  const callBackURL = (values: FormValues, json: any) => {
    const queryParams = new URLSearchParams(json.params);
    const codeValue = queryParams.get('code');
    if (values && codeValue && codeValue !== 'undefined') {
      const input = {
        data: {
          client_id: values.client_id,
          client_secret: values.client_secret,
          details: values.details,
          scope: values.scope.map((item: any) => item.value).join(','),
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
      toast.error('Please check the app Scope. Scope selections are invalid.');
    }
  };

  const onSubmit = async (values: FormValues) => {
    const authorizationUrl = `https://webflow.com/oauth/authorize?response_type=code&client_id=${
      values.client_id
    }&scope=${encodeURIComponent(
      values.scope.map((item: any) => item.value).join(' '),
    )}`;

    openSignInWindow(authorizationUrl, 'OAuth', callBackURL, values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={`App Description`}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } your details and necessary information from here`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-client-id')}
            {...register('client_id')}
            error={t(errors.client_id?.message!)}
            variant="outline"
            className="mb-5"
          />

          <Input
            label={t('form:input-label-client-secret')}
            {...register('client_secret')}
            error={t(errors.client_secret?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <Label>{t('form:input-label-scope-options')}</Label>
            <SelectInput
              name="scope"
              control={control}
              getOptionLabel={(option: any) => {
                return option.label
                  .split(':')
                  .join(' ')
                  .replace(/(?:^|\s)\S/g, function (a : any) {
                    return a.toUpperCase();
                  });
              }}
              isCloseMenuOnSelect={false}
              options={SCOPE_OPTION}
              isMulti
              isClearable={false}
            />

            <ValidationError message={t(errors.scope?.message)} />
          </div>

          <div className="relative">
            <TextArea
              label={t('form:input-label-details')}
              {...register('details')}
              variant="outline"
              className="mb-5"
            />
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
              ? t('form:button-label-update-app')
              : t('form:button-label-add-app')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
