import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BigButton } from '../../components/BigButton';
import { DashboardCard } from '../../components/DashboardCard';
import { registerCaregiverDeviceForPush } from '../../services/caregiverPushRegistration';
import {
  getLastActiveAt,
  getRecentHelpRequestHistory,
  getTodayMedicationSummary,
} from '../../services/caregiverDashboardData';
import { getMemoryPrompt, saveMemoryPrompt } from '../../services/memoryPromptSync';
import type { HelpRequestHistoryItem, MedicationSummaryData } from '../../types/caregiverDashboard';
import { CarePreferencesCard } from './CarePreferencesCard';
import { ExerciseAccuracyCard } from './ExerciseAccuracyCard';
import { FamilyMemberCard } from './FamilyMemberCard';
import { HandExerciseSettingsCard } from './HandExerciseSettingsCard';
import { HandExerciseSummaryCard } from './HandExerciseSummaryCard';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string | null): string {
  if (!iso) return '기록 없음';
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CaregiverDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [medicationSummary, setMedicationSummary] = useState<MedicationSummaryData | null>(null);
  const [helpRequests, setHelpRequests] = useState<HelpRequestHistoryItem[]>([]);
  const [lastActiveAt, setLastActiveAt] = useState<string | null>(null);
  const [breakfast, setBreakfast] = useState('');
  const [yesterdayEvent, setYesterdayEvent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const [summary, history, lastActive, prompt] = await Promise.all([
      getTodayMedicationSummary(),
      getRecentHelpRequestHistory(10),
      getLastActiveAt(),
      getMemoryPrompt(todayKey()),
    ]);
    setMedicationSummary(summary);
    setHelpRequests(history);
    setLastActiveAt(lastActive);
    setBreakfast(prompt?.breakfast ?? '');
    setYesterdayEvent(prompt?.yesterdayEvent ?? '');
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
    void registerCaregiverDeviceForPush();
  }, [loadDashboard]);

  const handleSavePrompt = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    await saveMemoryPrompt({ date: todayKey(), breakfast, yesterdayEvent });
    setSaving(false);
    setSaved(true);
  }, [breakfast, yesterdayEvent]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const adherenceLabel =
    !medicationSummary || medicationSummary.totalLogged === 0
      ? '오늘 기록 없음'
      : `${medicationSummary.takenCount} / ${medicationSummary.totalLogged}회 (${Math.round(
          (medicationSummary.takenCount / medicationSummary.totalLogged) * 100
        )}%)`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={loadDashboard} />}
    >
      <Text style={styles.heading}>보호자 대시보드</Text>

      <DashboardCard title="오늘의 복약 이행률">
        <Text style={styles.value}>{adherenceLabel}</Text>
        {medicationSummary?.lastRecordedAt && (
          <Text style={styles.meta}>
            마지막 기록 {formatTime(medicationSummary.lastRecordedAt)}
          </Text>
        )}
      </DashboardCard>

      <DashboardCard title="최근 도움 요청">
        {helpRequests.length === 0 ? (
          <Text style={styles.value}>아직 요청 없음</Text>
        ) : (
          helpRequests.map((item, index) => (
            <View key={`${item.requestedAt}-${index}`} style={styles.listRow}>
              <Text style={styles.listText}>{formatTime(item.requestedAt)}</Text>
              <Text style={styles.listStatus}>
                전달됨{item.roomInfo ? ` · ${item.roomInfo}` : ''}
              </Text>
            </View>
          ))
        )}
      </DashboardCard>

      <DashboardCard title="최근 활동 시각">
        <Text style={styles.value}>{formatTime(lastActiveAt)}</Text>
      </DashboardCard>

      <DashboardCard title="기억력 훈련 콘텐츠 입력 (오늘)">
        <Text style={styles.label}>오늘 아침 식사</Text>
        <TextInput
          style={styles.textInput}
          value={breakfast}
          onChangeText={setBreakfast}
          placeholder="예: 흰죽과 계란찜"
          multiline
        />
        <Text style={styles.label}>어제 있었던 일</Text>
        <TextInput
          style={styles.textInput}
          value={yesterdayEvent}
          onChangeText={setYesterdayEvent}
          placeholder="예: 손녀가 병문안을 왔었어요"
          multiline
        />
        <BigButton
          label={saving ? '저장 중...' : '저장'}
          onPress={handleSavePrompt}
          disabled={saving || (breakfast.length === 0 && yesterdayEvent.length === 0)}
        />
        {saved && <Text style={styles.savedText}>저장했어요</Text>}
      </DashboardCard>

      <ExerciseAccuracyCard />
      <HandExerciseSummaryCard />
      <HandExerciseSettingsCard />
      <CarePreferencesCard />
      <FamilyMemberCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B1B1B',
  },
  meta: {
    fontSize: 14,
    color: '#78909C',
    marginTop: 4,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  listText: {
    fontSize: 16,
    color: '#1B1B1B',
  },
  listStatus: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: '#455A64',
    marginTop: 12,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  savedText: {
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
});
