import * as yup from 'yup';

export const appValidationSchema = yup.object().shape({
  name: yup.string().required(),
  logo: yup.object().required(),
});
