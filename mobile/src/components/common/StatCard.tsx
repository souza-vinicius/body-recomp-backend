import React from 'react';
import { Box, Heading, Text, VStack } from '@gluestack-ui/themed';
import { Icon } from './Icon';

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  color?: string;
};

export function StatCard({ label, value, unit, icon, color = '$primary500' }: StatCardProps) {
  return (
    <Box
      flex={1}
      bg="$white"
      borderRadius="$lg"
      p="$4"
      flexDirection="row"
      alignItems="center"
      sx={{
        shadowColor: '$black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Box
        // @ts-ignore
        bg={color}
        p="$2"
        borderRadius="$full"
        mr="$3"
      >
        <Icon name={icon} size={24} color="white" />
      </Box>
      <VStack>
        <Heading size="md" color="$textLight700">
          {label}
        </Heading>
        <Box flexDirection="row" alignItems="baseline">
          <Text fontSize="$2xl" fontWeight="$bold" color="$textLight900">
            {value}
          </Text>
          {unit && (
            <Text fontSize="$md" color="$textLight600" ml="$1">
              {unit}
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
