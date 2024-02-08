import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Form from '@/components/ui/forms/form';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { Routes } from '@/config/routes';
import { useLogin } from '@/data/user';
import type { LoginInput } from '@/types';
import { setAuthCredentials } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import Router from 'next/router';
import { useState } from 'react';
import * as yup from 'yup';

const loginFormSchema = yup.object().shape({
  identifier: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
});

const defaultValues = {
  identifier: '',
  password: '',
};

const LoginForm = () => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: login, isLoading, error } = useLogin();

  function onSubmit({ identifier, password }: LoginInput) {
    login(
      {
        identifier,
        password,
      },
      {
        onSuccess: (data) => {
          if (data?.jwt) {
            setAuthCredentials(
              data?.jwt,
              ['store_owner', 'super_admin'],
              ['super_admin'],
            );
            Router.push(Routes.dashboard);
            return;
          } else {
            setErrorMessage('form:error-credential-wrong');
          }
        },
        onError: () => {
          setErrorMessage('form:error-credential-wrong');
        },
      },
    );
  }

  return (
    <>
      <Form<LoginInput>
        validationSchema={loginFormSchema}
        onSubmit={onSubmit}
        useFormProps={{ defaultValues }}
      >
        {({ register, formState: { errors } }) => (
          <>
            <Input
              label={t('form:input-label-email')}
              {...register('identifier')}
              type="email"
              variant="outline"
              className="mb-4"
              error={t(errors?.identifier?.message!)}
            />
            <PasswordInput
              label={t('form:input-label-password')}
              forgotPassHelpText={t('form:input-forgot-password-label')}
              {...register('password')}
              error={t(errors?.password?.message!)}
              variant="outline"
              className="mb-4"
            />
            <Button className="w-full" loading={isLoading} disabled={isLoading}>
              {t('form:button-label-login')}
            </Button>
          </>
        )}
      </Form>
      {errorMessage ? (
        <Alert
          message={t(errorMessage)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
    </>
  );
};

export default LoginForm;
