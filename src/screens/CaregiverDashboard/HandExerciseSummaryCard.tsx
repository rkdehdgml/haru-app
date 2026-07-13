import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { DashboardCard } from '../../components/DashboardCard';
import { getTodayHandExerciseSummary } from '../../services/caregiverDashboardData';
import type { HandExerciseSummaryData } from '../../types/caregiverDashboard';

export function HandExerciseSummaryCard() {
  const [summary, setSummary] = useState<HandExerciseSummaryData | null>(null);

  useEffect(() => {
    void getTodayHandExerciseSummary().then(setSummary);
  }, []);

  const label =
    !summary || summary.completedExerciseCount === 0
      ? '오늘 기록 없음'
      : `${summary.completedExerciseCount}개 운동 · 총 ${summary.totalCompletedReps}회`;

  return (
    <DashboardCard title="오늘의 손 힘 훈련">
      <Text style={styles.value}>{label}</Text>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B1B1B',
  },
});
