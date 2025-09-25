import { TextField, TextFieldProps } from "@shopify/polaris";
import { useCallback } from "react";

interface TextInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email';
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email';
  error?: string;
}

export function TextInput({
  value,
  onChange,
  type = 'text',
  inputMode,
  error,
  ...props
}: TextInputProps) {
  const handleChange = useCallback(
    (value: string) => {
      if (type === 'number' || inputMode === 'numeric') {
        onChange(value.replace(/[^0-9]/g, ''));
      } else {
        onChange(value);
      }
    },
    [onChange, type, inputMode]
  );

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      type={type}
      inputMode={inputMode}
      error={error}
    />
  );
}
