import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import { useWatch } from 'react-hook-form';
import Description from '../ui/description';
import UrlContentFetcher from './urlContentFetcher';

interface Props {
  register: any;
  errors: any;
  control: any;
  setApiResponse: any;
}

const RestAPIComponent: React.FC<Props> = ({
  register,
  errors,
  control,
  setApiResponse,
}) => {
  const fieldPrefix = 'steps.step1';
  const errorField = errors?.steps?.step1;
  const apiURL = useWatch({
    control,
    name: `${fieldPrefix}.apiURL`,
  });

  return (
    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
      <Description
        title={'API Details'}
        details={`API URL`}
        className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
      />

      <Card className="w-full sm:w-8/12 md:w-2/3">
        <Input
          label={'Api URL'}
          {...register(`${fieldPrefix}.apiURL`)}
          error={errorField?.apiURL?.message}
          variant="outline"
          className="mb-5"
        />
        {apiURL && (
          <UrlContentFetcher
            key={`url1`}
            url={apiURL}
            onURLChange={setApiResponse}
          />
        )}
      </Card>
    </div>
  );
};

export default RestAPIComponent;
