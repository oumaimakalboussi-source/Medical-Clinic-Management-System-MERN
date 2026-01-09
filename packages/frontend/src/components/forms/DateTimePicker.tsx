import React from 'react';
import { TextField, Box } from '@mui/material';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  label?: string;
}

/**
 * DateTimePicker Component
 * Combines separate date and time inputs for better browser compatibility
 */
export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  minDate,
  label = 'Date & Time',
}) => {
  const dateValue = value ? value.split('T')[0] : '';
  const timeValue = value ? value.split('T')[1] || '10:00' : '10:00';

  const handleDateChange = (newDate: string) => {
    const time = value?.split('T')[1] || '10:00';
    onChange(`${newDate}T${time}`);
  };

  const handleTimeChange = (newTime: string) => {
    const date = value?.split('T')[0] || new Date().toISOString().split('T')[0];
    onChange(`${date}T${newTime}`);
  };

  const datePickerStyles = {
    '& input[type="date"], & input[type="time"]': {
      position: 'relative',
      cursor: 'pointer',
    },
    '& input[type="date"]::-webkit-calendar-picker-indicator, & input[type="time"]::-webkit-calendar-picker-indicator': {
      position: 'absolute',
      right: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer',
    },
    '& input[type="date"]::-webkit-inner-spin-button, & input[type="time"]::-webkit-inner-spin-button': {
      display: 'none',
    },
  };

  return (
    <Box>
      <TextField
        fullWidth
        label={`${label} - Date`}
        type="date"
        value={dateValue}
        onChange={(e) => handleDateChange(e.target.value)}
        required={required}
        disabled={disabled}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        inputProps={{
          min: minDate || new Date().toISOString().split('T')[0],
        }}
        sx={datePickerStyles}
        placeholder="YYYY-MM-DD"
      />

      <TextField
        fullWidth
        label={`${label} - Time`}
        type="time"
        value={timeValue}
        onChange={(e) => handleTimeChange(e.target.value)}
        required={required}
        disabled={disabled}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        sx={datePickerStyles}
        placeholder="HH:MM"
      />
    </Box>
  );
};
