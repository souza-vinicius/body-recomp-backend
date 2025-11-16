import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Spinner } from '@gluestack-ui/themed';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color = '#2196F3',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <Spinner size={size === 'small' ? 'small' : 'large'} color={color} />
      </View>
    );
  }

  return <Spinner size={size === 'small' ? 'small' : 'large'} color={color} />;
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
