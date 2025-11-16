import React from 'react';
import { Box, Heading, Text } from '@gluestack-ui/themed';
import { ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'filled';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  variant = 'elevated',
  ...props
}) => {
  const getCardStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          bg: '$white',
          shadowColor: '$black',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outline':
        return {
          bg: '$white',
          borderWidth: 1,
          borderColor: '$gray300',
        };
      case 'filled':
        return {
          bg: '$gray50',
        };
      default:
        return {};
    }
  };

  return (
    <Box
      p="$4"
      borderRadius="$lg"
      {...getCardStyles()}
      {...props}
    >
      {title && (
        <Heading size="md" mb="$2">
          {title}
        </Heading>
      )}
      {subtitle && (
        <Text size="sm" color="$gray600" mb="$3">
          {subtitle}
        </Text>
      )}
      {children}
    </Box>
  );
};
