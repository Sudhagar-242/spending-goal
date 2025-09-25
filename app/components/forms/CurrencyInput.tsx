import { TextField } from "@shopify/polaris";
import { useCallback } from "react";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  currencyCode: string;
  label: string;
  error?: string;
  helpText?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currencyCode,
  label,
  error,
  helpText = `Saved as amount (integer, ${currencyCode})`
}: CurrencyInputProps) {
  const handleChange = useCallback(
    (value: string) => {
      onChange(value.replace(/[^0-9]/g, ''));
    },
    [onChange]
  );

  return (
    <TextField
      label={`${label} (${currencyCode})`}
      value={value}
      onChange={handleChange}
      autoComplete="off"
      inputMode="numeric"
      helpText={helpText}
      error={error}
    />
  );
}
