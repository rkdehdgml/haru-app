import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { DashboardCard } from '../../components/DashboardCard';
import {
  getHandExerciseSettings,
  saveHandExerciseSetting,
} from '../../services/storage/handExerciseSettingsStorage';
import type { HandExerciseSetting } from '../../types/handExercise';

/**
 * 담당 치료사 확인 후 "오늘 어떤 운동을 포함할지"와 "목표 횟수"를 조정하는 카드.
 * 운동 종류 자체(이름/설명/영상)는 정적 카탈로그에서 가져오고, 이 화면에서는
 * enabled/targetReps만 로컬에 덮어써서 하드코딩된 값을 바꿀 수 있게 한다.
 */
export function HandExerciseSettingsCard() {
  const [settings, setSettings] = useState<HandExerciseSetting[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setSettings(await getHandExerciseSettings());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = useCallback(
    async (item: HandExerciseSetting) => {
      setSaving(item.id);
      await saveHandExerciseSetting(item.id, { targetReps: item.targetReps, enabled: !item.enabled });
      await load();
      setSaving(null);
    },
    [load]
  );

  const handleRepsChange = useCallback((id: string, text: string) => {
    const parsed = Number.parseInt(text, 10);
    setSettings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, targetReps: Number.isNaN(parsed) ? 0 : parsed } : item))
    );
  }, []);

  const handleRepsSave = useCallback(
    async (item: HandExerciseSetting) => {
      setSaving(item.id);
      await saveHandExerciseSetting(item.id, {
        targetReps: Math.max(1, item.targetReps),
        enabled: item.enabled,
      });
      await load();
      setSaving(null);
    },
    [load]
  );

  return (
    <DashboardCard title="손 힘 훈련 설정">
      {settings.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.name}>
              {item.icon} {item.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleToggle(item)}
              style={[styles.toggle, item.enabled && styles.toggleOn]}
            >
              <Text style={[styles.toggleText, item.enabled && styles.toggleTextOn]}>
                {item.enabled ? '포함' : '제외'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.repsRow}>
            <Text style={styles.label}>목표 횟수</Text>
            <TextInput
              style={styles.repsInput}
              value={String(item.targetReps)}
              onChangeText={(text) => handleRepsChange(item.id, text)}
              onEndEditing={() => handleRepsSave(item)}
              keyboardType="number-pad"
            />
          </View>
        </View>
      ))}
      <BigButton
        label={saving ? '저장 중...' : '새로고침'}
        variant="secondary"
        onPress={load}
        disabled={Boolean(saving)}
      />
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B1B',
  },
  toggle: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#ECEFF1',
  },
  toggleOn: {
    backgroundColor: '#E8F5E9',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78909C',
  },
  toggleTextOn: {
    color: '#2E7D32',
  },
  repsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#455A64',
  },
  repsInput: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    minWidth: 64,
    textAlign: 'center',
  },
});
