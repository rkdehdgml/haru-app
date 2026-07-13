import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton } from '../../components/BigButton';
import { DashboardCard } from '../../components/DashboardCard';
import { getNextMedicationOccurrence, MEDICATION_SCHEDULES } from '../../data/medicationSchedule';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { recordAppOpened } from '../../services/activitySync';
import { getMemoryPrompt } from '../../services/memoryPromptSync';
import { getTodayHandExerciseLogs } from '../../services/storage/handExerciseLogStorage';
import { getTodayResultCounts } from '../../services/storage/exerciseResultStorage';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const insets = useSafeAreaInsets();
  const [rehabSchedule, setRehabSchedule] = useState('');
  const [cognitiveDone, setCognitiveDone] = useState(0);
  const [memoryDone, setMemoryDone] = useState(0);
  const [handExerciseDone, setHandExerciseDone] = useState(0);

  useEffect(() => {
    // 환자용 Home 화면 마운트 시점에 활동 기록 — 이전에는 임시 스위처의 App 마운트 시점이었음.
    void recordAppOpened();
  }, []);

  const loadTodaySummary = useCallback(() => {
    void getMemoryPrompt(todayKey()).then((prompt) => setRehabSchedule(prompt?.rehabSchedule ?? ''));
    void getTodayResultCounts().then((counts) => {
      setCognitiveDone(counts.cognitive);
      setMemoryDone(counts.memory);
    });
    void getTodayHandExerciseLogs().then((logs) =>
      setHandExerciseDone(logs.reduce((sum, log) => sum + log.completedReps, 0))
    );
  }, []);

  // 훈련 화면을 다녀온 뒤 Home으로 돌아올 때마다 오늘 진행 상황을 새로 반영한다.
  useFocusEffect(loadTodaySummary);

  const now = new Date();
  const dateLabel = now.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  const nextMedication = getNextMedicationOccurrence(MEDICATION_SCHEDULES, now);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>

        <DashboardCard title="오늘 재활치료 일정">
          <Text style={styles.value}>{rehabSchedule || '등록된 일정이 없어요'}</Text>
        </DashboardCard>

        <DashboardCard title="다음 복약">
          {nextMedication ? (
            <Text style={styles.value}>
              {nextMedication.schedule.name} · {nextMedication.schedule.scheduledTime}
              {nextMedication.isToday ? '' : ' (내일)'}
            </Text>
          ) : (
            <Text style={styles.value}>등록된 복약이 없어요</Text>
          )}
        </DashboardCard>

        <Text style={styles.sectionTitle}>오늘의 훈련</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('CognitiveTraining')}
          style={({ pressed }) => [styles.trainingRow, pressed && styles.trainingRowPressed]}
        >
          <Text style={styles.trainingLabel}>🧠 인지훈련</Text>
          <Text style={styles.trainingCount}>오늘 {cognitiveDone}문제 완료</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('MemoryTraining')}
          style={({ pressed }) => [styles.trainingRow, pressed && styles.trainingRowPressed]}
        >
          <Text style={styles.trainingLabel}>📷 기억력훈련</Text>
          <Text style={styles.trainingCount}>오늘 {memoryDone}문제 완료</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('HandExercise')}
          style={({ pressed }) => [styles.trainingRow, pressed && styles.trainingRowPressed]}
        >
          <Text style={styles.trainingLabel}>✋ 손힘훈련</Text>
          <Text style={styles.trainingCount}>오늘 {handExerciseDone}회 완료</Text>
        </Pressable>

      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="보호자 대시보드"
        onPress={() => navigation.navigate('CaregiverDashboard')}
        style={[styles.caregiverLink, { top: insets.top + 8 }]}
      >
        <Text style={styles.caregiverLinkText}>보호자 대시보드</Text>
      </Pressable>

      <View style={styles.helpButtonWrap}>
        <BigButton
          label="도움 요청"
          variant="danger"
          onPress={() => navigation.navigate('HelpRequest')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 16,
  },
  dateLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  value: {
    fontSize: 18,
    color: '#1B1B1B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#455A64',
    marginTop: 8,
    marginBottom: 12,
  },
  trainingRow: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#F5F7F8',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainingRowPressed: {
    opacity: 0.7,
  },
  trainingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B1B1B',
  },
  trainingCount: {
    fontSize: 14,
    color: '#78909C',
  },
  // 환자가 일상적으로 쓰는 카드/버튼과 멀리 떨어진 우상단 구석에 작고 눈에 덜 띄게 배치해서
  // 실수로 탭할 가능성을 낮춘다 (환자용 화면에는 없는 보호자 전용 진입점).
  caregiverLink: {
    position: 'absolute',
    right: 8,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  caregiverLinkText: {
    fontSize: 12,
    color: '#CFD8DC',
  },
  helpButtonWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
});
