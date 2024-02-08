import Select from '@/components/ui/select/select';
import { useId } from 'react';
import { Controller } from 'react-hook-form';
import { GetOptionLabel } from 'react-select';

interface SelectInputProps {
  control: any;
  rules?: any;
  name: string;
  options: object[];
  getOptionLabel?: GetOptionLabel<unknown>;
  getOptionValue?: GetOptionLabel<unknown>;
  isMulti?: boolean;
  isClearable?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  [key: string]: unknown;
  placeholder?: string;
}
function isEqual(option: any, value: any) {
  if (value) {
    if (
      (typeof value === 'string' || typeof value === 'number') &&
      (typeof option === 'string' || typeof option === 'number')
    ) {
      if (option.toString() == value.toString()) {
        return true;
      }
    }

    if (typeof value === 'object') {
      return option.value == (value?.id || value?.value) || null;
    } else if (
      typeof option === 'object' &&
      option.value.toString() == value.toString()
    ) {
      return true;
    }
  }
  return undefined;
}

const styles: any = {
  multiValueRemove: (base: any, state: any) => {
    return state.data.isFixed ? { ...base, display: 'none' } : base;
  },
};
const SelectInput = ({
  control,
  options,
  name,
  rules,
  getOptionLabel,
  getOptionValue,
  disabled,
  isMulti,
  isClearable,
  isLoading,
  placeholder,
  ...rest
}: SelectInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      {...rest}
      render={({ field }) => (
        <Select
          {...field}
          // eslint-disable-next-line react-hooks/rules-of-hooks
          instanceId={useId()}
          value={
            !isMulti
              ? field.value &&
                options?.find((c) => {
                  let optionData: any = c;
                  let fieldData: any = field.value;

                  if (getOptionValue) {
                    optionData = getOptionValue(c);
                    fieldData = getOptionValue(field.value);
                  }
                  return isEqual(optionData, fieldData);
                })
              : field.value
          }
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          placeholder={placeholder}
          isMulti={isMulti}
          isClearable={isClearable}
          isLoading={isLoading}
          options={options}
          isDisabled={disabled as boolean}
        />
      )}
    />
  );
};

export default SelectInput;
