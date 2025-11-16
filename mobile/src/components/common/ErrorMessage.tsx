import React from 'react';
import { Alert, AlertIcon, AlertText, InfoIcon } from '@gluestack-ui/themed';

interface ErrorMessageProps {
  message: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  variant = 'error',
  onDismiss,
}) => {
  const getAction = () => {
    switch (variant) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'error';
    }
  };

  return (
    <Alert action={getAction()} variant="solid">
      <AlertIcon as={InfoIcon} mr="$3" />
      <AlertText>{message}</AlertText>
    </Alert>
  );
};
