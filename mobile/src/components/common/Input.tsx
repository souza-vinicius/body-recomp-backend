import React from 'react';
import {
  Input as GluestackInput,
  InputField,
  InputSlot,
  InputIcon,
} from '@gluestack-ui/themed';
import { TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'onChange'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'outline' | 'underlined' | 'rounded';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'text' | 'password';
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  isInvalid = false,
  isDisabled = false,
  isReadOnly = false,
  size = 'md',
  variant = 'outline',
  leftIcon,
  rightIcon,
  type = 'text',
  ...props
}) => {
  return (
    <GluestackInput
      variant={variant}
      size={size}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isReadOnly={isReadOnly}
    >
      {leftIcon && <InputSlot pl="$3">{leftIcon}</InputSlot>}
      <InputField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        type={type}
        {...props}
      />
      {rightIcon && <InputSlot pr="$3">{rightIcon}</InputSlot>}
    </GluestackInput>
  );
};
