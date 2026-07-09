import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

export interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * 보호자 대시보드의 카드형 위젯 리스트 패턴.
 * 5단계 이후 인지훈련/기억력훈련 결과 카드도 이 컴포넌트로 같은 리스트에 추가하면 된다.
 */
export function DashboardCard({ title, children, style }: DashboardCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F7F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#455A64',
    marginBottom: 12,
  },
});
