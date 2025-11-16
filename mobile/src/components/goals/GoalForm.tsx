/**
 * GoalForm Component
 * Form for creating a new goal with date pickers and target selection
 */

import React, { useState } from 'react';
import { Platform } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Box,
} from '@gluestack-ui/themed';
import { Controller, UseFormReturn } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GoalType } from '../../types/goals';
import { GoalFormData } from '../../services/validation/schemas';
import { formatDate } from '../../utils/dates';

interface GoalFormProps {
  form: UseFormReturn<GoalFormData>;
  goalType: GoalType;
  currentBodyFat: number;
  gender: 'MALE' | 'FEMALE';
  disabled?: boolean;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  form,
  goalType,
  currentBodyFat,
  gender,
  disabled = false,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setValue('startDate', selectedDate.toISOString());
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setValue('endDate', selectedDate.toISOString());
    }
  };

  const minSafeBodyFat = gender === 'MALE' ? 8 : 15;

  return (
    <VStack space="lg">
      {/* Current Body Fat Display */}
      <Box backgroundColor="$backgroundLight100" padding="$4" borderRadius="$md">
        <VStack space="sm">
          <Text fontSize="$sm" color="$textLight600">
            Current Body Fat
          </Text>
          <Text fontSize="$2xl" fontWeight="$bold" color="$textLight900">
            {currentBodyFat.toFixed(1)}%
          </Text>
          <Text fontSize="$xs" color="$textLight600">
            {goalType === GoalType.CUTTING
              ? `Safe minimum: ${minSafeBodyFat}%`
              : 'Set a ceiling to maintain lean mass'}
          </Text>
        </VStack>
      </Box>

      {/* Target Body Fat */}
      <FormControl isInvalid={!!errors.targetBodyFat} isDisabled={disabled}>
        <FormControlLabel>
          <FormControlLabelText>
            {goalType === GoalType.CUTTING ? 'Target' : 'Ceiling'} Body Fat (%)
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="targetBodyFat"
          render={({ field: { onChange, value } }) => (
            <Input>
              <InputField
                placeholder={
                  goalType === GoalType.CUTTING
                    ? `Enter target (min ${minSafeBodyFat}%)`
                    : 'Enter ceiling'
                }
                keyboardType="decimal-pad"
                value={value?.toString() || ''}
                onChangeText={(text: string) => {
                  const num = parseFloat(text);
                  onChange(isNaN(num) ? undefined : num);
                }}
              />
            </Input>
          )}
        />
        {errors.targetBodyFat && (
          <FormControlError>
            <FormControlErrorText>
              {errors.targetBodyFat.message}
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* Start Date */}
      <FormControl isInvalid={!!errors.startDate} isDisabled={disabled}>
        <FormControlLabel>
          <FormControlLabelText>Start Date</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="startDate"
          render={({ field: { value } }) => (
            <>
              <Button
                onPress={() => setShowStartDatePicker(true)}
                variant="outline"
                isDisabled={disabled}
              >
                <ButtonText>
                  {value ? formatDate(value) : 'Select start date'}
                </ButtonText>
              </Button>
              {showStartDatePicker && (
                <DateTimePicker
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        />
        {errors.startDate && (
          <FormControlError>
            <FormControlErrorText>{errors.startDate.message}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* End Date */}
      <FormControl isInvalid={!!errors.endDate} isDisabled={disabled}>
        <FormControlLabel>
          <FormControlLabelText>End Date</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="endDate"
          render={({ field: { value } }) => (
            <>
              <Button
                onPress={() => setShowEndDatePicker(true)}
                variant="outline"
                isDisabled={disabled}
              >
                <ButtonText>
                  {value ? formatDate(value) : 'Select end date'}
                </ButtonText>
              </Button>
              {showEndDatePicker && (
                <DateTimePicker
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                  minimumDate={
                    startDate ? new Date(startDate) : new Date()
                  }
                />
              )}
            </>
          )}
        />
        {errors.endDate && (
          <FormControlError>
            <FormControlErrorText>{errors.endDate.message}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* Notes (Optional) */}
      <FormControl isInvalid={!!errors.notes} isDisabled={disabled}>
        <FormControlLabel>
          <FormControlLabelText>Notes (Optional)</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input>
              <InputField
                placeholder="Add any notes about your goal..."
                multiline
                numberOfLines={3}
                value={value || ''}
                onChangeText={onChange}
                maxLength={500}
              />
            </Input>
          )}
        />
        {errors.notes && (
          <FormControlError>
            <FormControlErrorText>{errors.notes.message}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* Duration Calculation Display */}
      {startDate && endDate && (
        <Box backgroundColor="$backgroundLight100" padding="$3" borderRadius="$md">
          <Text fontSize="$sm" color="$textLight600">
            Goal Duration:{' '}
            <Text fontWeight="$semibold" color="$textLight900">
              {Math.floor(
                (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days
            </Text>
          </Text>
        </Box>
      )}
    </VStack>
  );
};
