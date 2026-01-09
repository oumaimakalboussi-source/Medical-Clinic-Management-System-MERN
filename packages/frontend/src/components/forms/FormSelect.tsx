import React from 'react';
import { TextField, MenuItem } from '@mui/material';

/**
 * FormSelect Component
 * Reusable select input with predefined options
 */

interface FormSelectProps {
  options: Array<{ label: string; value: any }>;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  [key: string]: any;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  options,
  label,
  value,
  onChange,
  required,
  ...props
}) => {
  return (
    <TextField
      select
      fullWidth
      margin="normal"
      size="small"
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
