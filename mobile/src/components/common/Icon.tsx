import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { styled, AsForwarder } from '@gluestack-style/react';

const StyledIonicons = styled(
  Ionicons,
  {},
  {
    componentName: 'Icon',
    resolveProps: ['size'],
  } as const,
  {
    plugins: [],
  }
);

const Icon = React.forwardRef(({ ...props }: React.ComponentProps<typeof StyledIonicons>, ref) => {
  return <StyledIonicons {...props} ref={ref} />;
});

const GluestackUIStyledIcon = styled(
  Icon,
  {},
  {
    componentName: 'Icon',
    resolveProps: ['size'],
  } as const,
  {
    plugins: [],
  }
);

export const AsForwarderIcon = styled(
  AsForwarder,
  {},
  {
    componentName: 'Icon',
    resolveProps: ['size'],
  } as const,
  {
    plugins: [],
  }
);

export { GluestackUIStyledIcon as Icon };
