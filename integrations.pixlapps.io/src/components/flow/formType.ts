import { UseFormRegister } from 'react-hook-form';

export type FormValues = {
  apiResponse: any;
  name: string;
  cron: string;
  integrationType: any;
  app: {
    id: number;
  };
  app_credential: {
    id: number;
  };
  steps: {
    step1: any;
    step2: any;
  };

  collection: {
    id: string;
  };
  site: {
    id: string;
  };
  url: string;
  items: any;
  ref_key_field: any;
  snapshot_field: string;
};

export type IProps = {
  initialValues?: any;
};

export interface FieldMapping {
  lhsData: any;
  rhsData: any;
  control: any;
  register: UseFormRegister<FormValues>;
  setFormValue: any;
}

export const COMPONENT = [
  { value: 'tixer', label: 'Tixer' },
  { value: 'restapi', label: 'RestApi' },
];

export interface JSONataEditorProps {
  initialExpression: any;
  content: any;
  onEvaluate: (result: any) => void;
}
