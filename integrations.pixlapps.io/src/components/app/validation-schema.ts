import * as yup from 'yup';

export const appValidationSchema = yup.object().shape({
  client_id: yup.string().required(),
  client_secret: yup.string().required(),
  scope: yup.array().required().min(1),
});
