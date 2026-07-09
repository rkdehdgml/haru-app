import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

export type BigButtonVariant = 'primary' | 'secondary' | 'danger';

export interface BigButtonProps {
  label: string;
  onPress: () => void;
  variant?: BigButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const VARIANT_COLORS: Record<BigButtonVariant, string> = {
  primary: '#2E7D32',
  secondary: '#455A64',
  danger: '#C62828',
};

/**
 * 앱 전체에서 쓰는 공통 큰 버튼.
 * 환자는 손 힘이 약해 롱프레스/스와이프/더블탭을 쓸 수 없으므로,
 * 이 컴포넌트는 의도적으로 onPress(가벼운 탭 한 번)만 지원한다.
 * onLongPress 등은 노출하지 않는다 — 위험한 동작은 화면 단에서
 * 3초 카운트다운 패턴으로 별도 처리한다.
 */
export function BigButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  testID,
}: BigButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: VARIANT_COLORS[variant] },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, icon ? styles.labelWithIcon : null]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    // 버튼 최소 높이 52~56px 규격을 상회하도록 고정
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // 버튼 간 여백 16px 이상 — 상하 8px씩, 인접 버튼과 합쳐 16px 확보
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    // 글자 크기 최소 16px 규격을 상회
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelWithIcon: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
});
