import cronstrue from 'cronstrue';
import * as yup from 'yup';
declare module 'yup' {
  interface StringSchema {
    cron(): StringSchema;
  }
}
yup.addMethod(yup.string, 'cron', function (errorMessage) {
  return this.test(`test-card-type`, errorMessage, function (value) {
    const { path, createError } = this;
    let isValid = true;
    try {
      if (value) {
        const text = cronstrue.toString(value);
        isValid = true;
      } else {
        isValid = false;
      }
    } catch (error) {
      isValid = false;
    }
    return isValid === true || createError({ path, message: 'Invalid field' });
  });
});

export const appValidationSchema = yup.object().shape({
  name: yup.string().required(),
  cron: yup.string().cron().required(),
  integrationType: yup.mixed().required(),
  ref_key_field: yup.mixed().required('Refrence Key is required'),
  app: yup.mixed().required('App is required'),
  app_credential: yup.mixed().required('Credential is required'),
  steps: yup.object().when('integrationType', (values, schema) => {
    const integrationType = values[0];
    if (integrationType && integrationType.value === 'tixer') {
      return schema.shape({
        step1: yup.object().shape({
          auth_key: yup.string().required('Auth Key is required'),
          group: yup.mixed().required('Group is required'),
        }),
        step2: yup.object().shape({
          site: yup.mixed().required('Site is required'),
          collection: yup.mixed().required('collection is required'),
        }),
      });
    }
    if (integrationType && integrationType.value === 'restapi') {
      return schema.shape({
        step1: yup.object().shape({
          apiURL: yup
            .string()
            .url('Api URL must be a valid URL')
            .required('URL is required'),
        }),
        step2: yup.object().shape({
          site: yup.mixed().required('Site is required'),
          collection: yup.mixed().required('collection is required'),
        }),
      });
    }
    return schema.shape({});
  }),
});
