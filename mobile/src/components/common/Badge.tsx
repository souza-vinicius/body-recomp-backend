import { Badge as GluestackBadge, Text } from '@gluestack-ui/themed';
import React from 'react';

type BadgeProps = React.ComponentProps<typeof GluestackBadge> & {
  label: string;
};

export function Badge({ label, ...props }: BadgeProps) {
  return (
    <GluestackBadge {...props}>
      <Text>{label}</Text>
    </GluestackBadge>
  );
}
