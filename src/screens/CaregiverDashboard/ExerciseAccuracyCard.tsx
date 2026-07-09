import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DashboardCard } from '../../components/DashboardCard';
import { getExerciseAccuracySummary } from '../../services/caregiverDashboardData';
import type { ExerciseAccuracySummaryItem } from '../../services/caregiverDashboardData';

const TYPE_LABELS: Record<string, string> = {
  date_weekday_season: '날짜/요일/계절',
  am_pm: '오전/오후',
  location: '장소',
  card_matching: '카드 짝 맞추기',
  ordered_tap: '순서대로 터치',
  spot_the_difference: '다른 그림 찾기',
  today_breakfast_recall: '오늘 아침 식사',
  yesterday_event_quiz: '어제 있었던 일',
  family_photo_naming: '가족 사진',
  medical_staff_recall: '담당 의료진',
  short_term_word_recall: '단어 기억하기',
  photo_sequence_ordering: '순서 배열',
};

/** 5단계 훈련 결과의 유형별 정답률 — 3단계에서 만든 카드형 위젯 리스트를 그대로 확장한 것. */
export function ExerciseAccuracyCard() {
  const [items, setItems] = useState<ExerciseAccuracySummaryItem[]>([]);

  useEffect(() => {
    void getExerciseAccuracySummary().then(setItems);
  }, []);

  return (
    <DashboardCard title="훈련 정답률">
      {items.length === 0 ? (
        <Text style={styles.empty}>아직 기록 없음</Text>
      ) : (
        items.map((item) => (
          <View key={item.type} style={styles.row}>
            <Text style={styles.label}>{TYPE_LABELS[item.type] ?? item.type}</Text>
            <Text style={styles.value}>
              {item.correctCount} / {item.totalCount}회
            </Text>
          </View>
        ))
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 16,
    color: '#1B1B1B',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
    color: '#455A64',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
});
