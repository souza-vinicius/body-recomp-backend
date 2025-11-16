import React from 'react';
import { View, Text, VStack, HStack, Pressable } from '@gluestack-ui/themed';
import { CalculationMethod } from '../../types/measurements';

interface MethodSelectorProps {
  selectedMethod: CalculationMethod;
  onMethodChange: (method: CalculationMethod) => void;
  gender: 'MALE' | 'FEMALE';
}

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  gender,
}) => {
  const methods: Array<{
    value: CalculationMethod;
    label: string;
    description: string;
  }> = [
    {
      value: 'NAVY',
      label: 'Navy Method',
      description: gender === 'MALE' 
        ? 'Uses neck, waist, and height'
        : 'Uses neck, waist, hips, and height',
    },
    {
      value: 'THREE_SITE',
      label: '3-Site Skinfold',
      description: gender === 'MALE'
        ? 'Chest, abdomen, and thigh'
        : 'Tricep, suprailiac, and thigh',
    },
    {
      value: 'SEVEN_SITE',
      label: '7-Site Skinfold',
      description: 'Seven measurement points',
    },
  ];

  return (
    // @ts-ignore
    <VStack space="md">
      <Text fontSize={16} fontWeight="$semibold">
        Calculation Method
      </Text>
      {/* @ts-ignore */}
      <VStack space="sm">
        {methods.map((method) => (
          <Pressable
            key={method.value}
            onPress={() => onMethodChange(method.value)}
          >
            <HStack
              // @ts-ignore
              p="$4"
              borderRadius="$lg"
              borderWidth={2}
              borderColor={
                selectedMethod === method.value ? '$primary500' : '$gray300'
              }
              bg={selectedMethod === method.value ? '$primary50' : '$white'}
              alignItems="center"
              // @ts-ignore
              space="md"
            >
              <View
                // @ts-ignore
                h="$5"
                w="$5"
                borderRadius="$full"
                borderWidth={2}
                borderColor={
                  selectedMethod === method.value ? '$primary500' : '$gray400'
                }
                bg={selectedMethod === method.value ? '$primary500' : '$white'}
                alignItems="center"
                justifyContent="center"
              >
                {selectedMethod === method.value && (
                  <View
                    // @ts-ignore
                    h="$2"
                    w="$2"
                    borderRadius="$full"
                    bg="$white"
                  />
                )}
              </View>
              {/* @ts-ignore */}
              <VStack flex={1} space="xxs">
                <Text fontSize={16} fontWeight="$medium">
                  {method.label}
                </Text>
                <Text fontSize={12} color="$gray600">
                  {method.description}
                </Text>
              </VStack>
            </HStack>
          </Pressable>
        ))}
      </VStack>
    </VStack>
  );
};
