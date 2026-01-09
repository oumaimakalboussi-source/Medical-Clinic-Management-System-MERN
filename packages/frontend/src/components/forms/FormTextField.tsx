import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/**
 * FormTextField Component
 * Reusable text input field with validation
 */

export const FormTextField: React.FC<TextFieldProps> = (props) => {
  return (
    <TextField
      fullWidth
      margin="normal"
      size="small"
      {...props}
    />
  );
};
