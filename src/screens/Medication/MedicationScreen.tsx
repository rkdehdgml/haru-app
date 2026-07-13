import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { MEDICATION_SCHEDULES } from '../../data/medicationSchedule';
import { vibrateTap } from '../../services/haptics';
import {
  ensureNotificationPermission,
  scheduleMedicationReminder,
} from '../../services/notifications';
import { syncTodayMedicationSummary } from '../../services/medicationSync';
import { recordMedicationStatus } from '../../services/storage/medicationStorage';
import type { MedicationStatus } from '../../types/medication';

const SAMPLE_SCHEDULE = MEDICATION_SCHEDULES[0];

type ConfirmationState = { status: MedicationStatus } | null;

export function MedicationScreen() {
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const granted = await ensureNotificationPermission();
      if (!granted || cancelled) return;
      const [hour, minute] = SAMPLE_SCHEDULE.scheduledTime.split(':').map(Number);
      await scheduleMedicationReminder({
        id: SAMPLE_SCHEDULE.id,
        medicationName: SAMPLE_SCHEDULE.name,
        hour,
        minute,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePress = useCallback(async (status: MedicationStatus) => {
    // 복약 확인은 되돌릴 위험이 없는 동작이라, 도움 요청과 달리
    // 3초 카운트다운 없이 탭 한 번으로 즉시 처리한다.
    await vibrateTap();
    await recordMedicationStatus({
      scheduleId: SAMPLE_SCHEDULE.id,
      medicationName: SAMPLE_SCHEDULE.name,
      scheduledTime: SAMPLE_SCHEDULE.scheduledTime,
      status,
    });
    setConfirmation({ status });
    // 보호자 대시보드용 요약만 Firestore로 올린다 (개별 기록 전체는 로컬에만 둠).
    void syncTodayMedicationSummary();
  }, []);

  if (confirmation) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>{confirmation.status === 'taken' ? '✅' : '⏳'}</Text>
        <Text style={styles.confirmationText}>
          {confirmation.status === 'taken' ? '기록했어요' : '알겠어요, 다시 확인할게요'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💊</Text>
      <Text style={styles.medicationName}>{SAMPLE_SCHEDULE.name}</Text>
      <Text style={styles.time}>{SAMPLE_SCHEDULE.scheduledTime} 복용 시간이에요</Text>

      <View style={styles.buttonGroup}>
        <BigButton label="먹었어요" variant="primary" onPress={() => handlePress('taken')} />
        <BigButton
          label="간호사가 아직 안 주셨어요"
          variant="secondary"
          onPress={() => handlePress('not_given_yet')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 72,
    marginBottom: 16,
  },
  medicationName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  time: {
    fontSize: 18,
    color: '#455A64',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  confirmationText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});
