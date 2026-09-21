import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { theme, TypographyVariant } from '@/theme';
import { resolveFontFamily } from '@/theme/typography';
import { useTheme } from '@/context';

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
  const { colors } = useTheme();
  const variantStyle = theme.typography.variants[variant] || theme.typography.variants.body;
  const override = (StyleSheet.flatten(style) || {}) as TextStyle;

  // Precedence: explicit style > weight prop > variant default.
  const resolvedWeight = override.fontWeight ?? (weight ? theme.typography.weights[weight] : variantStyle.fontWeight);
  const italic = override.fontStyle === 'italic';

  const combinedStyle: TextStyle = StyleSheet.flatten([
    variantStyle,
    { color: color || colors.textPrimary, textAlign: align },
    override,
    {
      fontFamily: override.fontFamily ?? resolveFontFamily(variant, resolvedWeight, italic),
      // The weight/italic already live in the family name (see resolveFontFamily).
      fontWeight: override.fontFamily ? override.fontWeight : 'normal',
      fontStyle: override.fontFamily ? override.fontStyle : 'normal',
    },
  ]);

  return (
    <RNText style={combinedStyle} {...rest}>
      {children}
    </RNText>
  );
};
