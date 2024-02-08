import * as yup from 'yup';

export const appValidationSchema = yup.object().shape({
  name: yup.string().required(),
  app: yup.mixed().required(),
});
