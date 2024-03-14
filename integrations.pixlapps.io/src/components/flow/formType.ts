import { UseFormRegister } from 'react-hook-form';

export type FormValues = {
  apiResponse: any;
  name: string;
  cron: string;
  integrationType: any;
  app: {
    id: number;
  };
  client: {
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
  action?: string;
};

export interface FieldMapping {
  lhsData: any;
  rhsData: any;
  control: any;
  register: UseFormRegister<FormValues>;
  setFormValue: any;
  disableSplitter?: boolean;
}

export const COMPONENT = [
  { value: 'tixr', label: 'Tixr' },
  { value: 'restapi', label: 'Rest API' },
  { value: 'rapidapi', label: 'Rapid API' },
  { value: 'spotify', label: 'Spotify' },
];

export const RAPIDAPI = [{ value: 'IGData', label: 'IG Data' }];
export const RAPIDAPI_TRIGGER = [
  { value: '/user/feed', label: 'user feed' },
  { value: '/user/feed/v2', label: 'user feed V2' },
];

export const SPOTIFY_API_TRIGGER = [{ value: 'search', label: 'search' }];

export interface JSONataEditorProps {
  initialExpression: any;
  content: any;
  onEvaluate: (result: any) => void;
}
