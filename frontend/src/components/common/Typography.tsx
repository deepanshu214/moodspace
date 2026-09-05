import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { theme, TypographyVariant } from '@/theme';

export interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: keyof typeof theme.typography.weights;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align = 'left',
  weight,
  style,
  children,
  ...rest
}) => {
  const variantStyle = theme.typography.variants[variant] || theme.typography.variants.body;
  const textColor = color || theme.colors.textPrimary;
  const fontWeight = weight ? theme.typography.weights[weight] : variantStyle.fontWeight;

  const combinedStyle: TextStyle = StyleSheet.flatten([
    variantStyle,
    {
      color: textColor,
      textAlign: align,
      fontWeight,
      fontFamily: theme.typography.fontFamily,
    },
    style,
  ]);

  return (
    <RNText style={combinedStyle} {...rest}>
      {children}
    </RNText>
  );
};
