import React from 'react';
import { Text, VStack } from '@gluestack-ui/themed';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Input } from '../common/Input';
import { CalculationMethod } from '../../types/measurements';
import { MeasurementFormData } from '../../services/validation/schemas';

interface MeasurementFormFieldsProps {
  control: Control<MeasurementFormData>;
  errors: FieldErrors<MeasurementFormData>;
  calculationMethod: CalculationMethod;
  gender: 'MALE' | 'FEMALE';
}

export const MeasurementFormFields: React.FC<MeasurementFormFieldsProps> = ({
  control,
  errors,
  calculationMethod,
  gender,
}) => {
  const renderNavyMethodFields = () => (
    <>
      {/* @ts-ignore */}
      <VStack space="xs">
        <Text fontSize={14} fontWeight="$medium">
          Neck Circumference (cm)
        </Text>
        <Controller
          control={control}
          name="neck"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value?.toString() || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., 38"
              keyboardType="decimal-pad"
              isInvalid={!!errors.neck}
            />
          )}
        />
        {errors.neck && (
          <Text fontSize={12} color="$error500">
            {errors.neck.message}
          </Text>
        )}
      </VStack>

      {/* @ts-ignore */}
      <VStack space="xs">
        <Text fontSize={14} fontWeight="$medium">
          Waist Circumference (cm)
        </Text>
        <Controller
          control={control}
          name="waist"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value?.toString() || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., 85"
              keyboardType="decimal-pad"
              isInvalid={!!errors.waist}
            />
          )}
        />
        {errors.waist && (
          <Text fontSize={12} color="$error500">
            {errors.waist.message}
          </Text>
        )}
      </VStack>

      {gender === 'FEMALE' && (
        // @ts-ignore
        <VStack space="xs">
          <Text fontSize={14} fontWeight="$medium">
            Hips Circumference (cm)
          </Text>
          <Controller
            control={control}
            name="hips"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value?.toString() || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g., 95"
                keyboardType="decimal-pad"
                isInvalid={!!errors.hips}
              />
            )}
          />
          {errors.hips && (
            <Text fontSize={12} color="$error500">
              {errors.hips.message}
            </Text>
          )}
        </VStack>
      )}
    </>
  );

  const renderThreeSiteFields = () => {
    if (gender === 'MALE') {
      return (
        <>
          {/* @ts-ignore */}
          <VStack space="xs">
            <Text fontSize={14} fontWeight="$medium">
              Chest Skinfold (mm)
            </Text>
            <Controller
              control={control}
              name="chest"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., 10"
                  keyboardType="decimal-pad"
                  isInvalid={!!errors.chest}
                />
              )}
            />
            {errors.chest && (
              <Text fontSize={12} color="$error500">
                {errors.chest.message}
              </Text>
            )}
          </VStack>

          {/* @ts-ignore */}
          <VStack space="xs">
            <Text fontSize={14} fontWeight="$medium">
              Abdomen Skinfold (mm)
            </Text>
            <Controller
              control={control}
              name="abdomen"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., 20"
                  keyboardType="decimal-pad"
                  isInvalid={!!errors.abdomen}
                />
              )}
            />
            {errors.abdomen && (
              <Text fontSize={12} color="$error500">
                {errors.abdomen.message}
              </Text>
            )}
          </VStack>

          {/* @ts-ignore */}
          <VStack space="xs">
            <Text fontSize={14} fontWeight="$medium">
              Thigh Skinfold (mm)
            </Text>
            <Controller
              control={control}
              name="thigh"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., 15"
                  keyboardType="decimal-pad"
                  isInvalid={!!errors.thigh}
                />
              )}
            />
            {errors.thigh && (
              <Text fontSize={12} color="$error500">
                {errors.thigh.message}
              </Text>
            )}
          </VStack>
        </>
      );
    } else {
      return (
        <>
          {/* @ts-ignore */}
          <VStack space="xs">
            <Text fontSize={14} fontWeight="$medium">
              Tricep Skinfold (mm)
            </Text>
            <Controller
              control={control}
              name="tricep"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., 18"
                  keyboardType="decimal-pad"
                  isInvalid={!!errors.tricep}
                />
              )}
            />
            {errors.tricep && (
              <Text fontSize={12} color="$error500">
                {errors.tricep.message}
              </Text>
            )}
          </VStack>

          {/* @ts-ignore */}
          <VStack space="xs">
            <Text fontSize={14} fontWeight="$medium">
              Suprailiac Skinfold (mm)
            </Text>
            <Controller
              control={control}
              name="suprailiac"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., 15"
                  keyboardType="decimal-pad"
                  isInvalid={!!errors.suprailiac}
                />
              )}
            />
            {errors.suprailiac && (
              <Text fontSize={12} color="$error500">
                {errors.suprailiac.message}
              </Text>
            )}
          </VStack>

          {/* @ts-ignore */}
          <VStack space="xs">
            <Text fontSize={14} fontWeight="$medium">
              Thigh Skinfold (mm)
            </Text>
            <Controller
              control={control}
              name="thigh"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., 20"
                  keyboardType="decimal-pad"
                  isInvalid={!!errors.thigh}
                />
              )}
            />
            {errors.thigh && (
              <Text fontSize={12} color="$error500">
                {errors.thigh.message}
              </Text>
            )}
          </VStack>
        </>
      );
    }
  };

  const renderSevenSiteFields = () => (
    <>
      {renderThreeSiteFields()}
      
      {/* @ts-ignore */}
      <VStack space="xs">
        <Text fontSize={14} fontWeight="$medium">
          Subscapular Skinfold (mm)
        </Text>
        <Controller
          control={control}
          name="subscapular"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value?.toString() || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., 12"
              keyboardType="decimal-pad"
              isInvalid={!!errors.subscapular}
            />
          )}
        />
        {errors.subscapular && (
          <Text fontSize={12} color="$error500">
            {errors.subscapular.message}
          </Text>
        )}
      </VStack>

      {/* @ts-ignore */}
      <VStack space="xs">
        <Text fontSize={14} fontWeight="$medium">
          Midaxillary Skinfold (mm)
        </Text>
        <Controller
          control={control}
          name="midaxillary"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value?.toString() || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., 14"
              keyboardType="decimal-pad"
              isInvalid={!!errors.midaxillary}
            />
          )}
        />
        {errors.midaxillary && (
          <Text fontSize={12} color="$error500">
            {errors.midaxillary.message}
          </Text>
        )}
      </VStack>
    </>
  );

  return (
    // @ts-ignore
    <VStack space="md">
      {calculationMethod === 'NAVY' && renderNavyMethodFields()}
      {calculationMethod === 'THREE_SITE' && renderThreeSiteFields()}
      {calculationMethod === 'SEVEN_SITE' && renderSevenSiteFields()}
    </VStack>
  );
};
