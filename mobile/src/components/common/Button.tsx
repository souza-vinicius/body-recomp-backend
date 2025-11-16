import React from 'react';
import {
  Button as GluestackButton,
  ButtonText,
  ButtonSpinner,
} from '@gluestack-ui/themed';
import { TouchableOpacityProps } from 'react-native';

interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isDisabled?: boolean;
  colorScheme?: 'primary' | 'success' | 'warning' | 'error';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'solid',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  colorScheme = 'primary',
  ...props
}) => {
  return (
    <GluestackButton
      size={size}
      variant={variant}
      action={colorScheme}
      isDisabled={isDisabled || isLoading}
      onPress={onPress}
      {...props}
    >
      {isLoading && <ButtonSpinner mr="$1" />}
      <ButtonText>{title}</ButtonText>
    </GluestackButton>
  );
};
