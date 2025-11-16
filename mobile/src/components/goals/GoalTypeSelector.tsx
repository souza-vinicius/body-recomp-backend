/**
 * GoalTypeSelector Component (fallback RN layout)
 * Simpler layout to ensure visibility if themed components misbehave.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GoalType } from '../../types/goals';

interface GoalTypeSelectorProps {
  value: GoalType;
  onChange: (value: GoalType) => void;
  disabled?: boolean;
}

export const GoalTypeSelector: React.FC<GoalTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const goalTypes = [
    {
      type: GoalType.CUTTING,
      title: 'Cutting',
      description: 'Reduce body fat while preserving muscle mass',
      icon: '📉',
    },
    {
      type: GoalType.BULKING,
      title: 'Bulking',
      description: 'Build muscle mass with controlled fat gain',
      icon: '📈',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Goal Type</Text>
      <View style={styles.row}>
        {goalTypes.map((goal) => {
          const selected = value === goal.type;
          return (
            <TouchableOpacity
              key={goal.type}
              style={[styles.card, selected && styles.cardSelected, disabled && styles.cardDisabled]}
              activeOpacity={0.7}
              onPress={() => !disabled && onChange(goal.type)}
              disabled={disabled}
            >
              <Text style={styles.icon}>{goal.icon}</Text>
              <Text style={[styles.title, selected && styles.titleSelected]}>{goal.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.helper}>
        {value === GoalType.CUTTING
          ? 'Cutting: Aim to reduce body fat safely.'
          : 'Bulking: Increase lean mass with controlled fat gain.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#e8f1fd',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 26,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  titleSelected: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  helper: {
    marginTop: 6,
    fontSize: 11,
    color: '#666',
  },
});
