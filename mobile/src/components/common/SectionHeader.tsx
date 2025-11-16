import React from 'react';
import { Box, Heading, Pressable, Text } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onPressAction?: () => void;
};

export function SectionHeader({ title, actionText, onPressAction }: SectionHeaderProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      // @ts-ignore
      mb="$3"
    >
      <Heading size="lg">{title}</Heading>
      {actionText && onPressAction && (
        <Pressable onPress={onPressAction} flexDirection="row" alignItems="center">
          {/* @ts-ignore */}
          <Text mr="$1" color="$primary500">
            {actionText}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="$primary500" />
        </Pressable>
      )}
    </Box>
  );
}
