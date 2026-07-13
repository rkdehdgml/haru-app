import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { VideoGuidePlayer } from '../../components/VideoGuidePlayer';
import { syncTodayHandExerciseSummary } from '../../services/handExerciseSync';
import { vibrateTap } from '../../services/haptics';
import { recordHandExerciseCompletion } from '../../services/storage/handExerciseLogStorage';
import { getHandExerciseSettings } from '../../services/storage/handExerciseSettingsStorage';
import type { HandExerciseSetting } from '../../types/handExercise';

type Phase = 'loading' | 'exercising' | 'complete';

export function HandExerciseScreen() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [exercises, setExercises] = useState<HandExerciseSetting[]>([]);
  const [index, setIndex] = useState(0);
  const [completedReps, setCompletedReps] = useState(0);
  const [totalRepsToday, setTotalRepsToday] = useState(0);

  useEffect(() => {
    void (async () => {
      const settings = await getHandExerciseSettings();
      const enabled = settings.filter((item) => item.enabled);
      setExercises(enabled);
      setPhase(enabled.length > 0 ? 'exercising' : 'complete');
    })();
  }, []);

  const current = exercises[index];

  const handleRepDone = useCallback(async () => {
    if (!current) return;
    await vibrateTap();
    const nextReps = completedReps + 1;

    if (nextReps >= current.targetReps) {
      await recordHandExerciseCompletion({
        exerciseId: current.id,
        exerciseName: current.name,
        completedReps: nextReps,
        targetReps: current.targetReps,
      });
      void syncTodayHandExerciseSummary();
      setTotalRepsToday((sum) => sum + nextReps);

      const nextIndex = index + 1;
      if (nextIndex >= exercises.length) {
        setPhase('complete');
      } else {
        setIndex(nextIndex);
        setCompletedReps(0);
      }
      return;
    }
    setCompletedReps(nextReps);
  }, [completedReps, current, exercises.length, index]);

  if (phase === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (phase === 'complete') {
    return (
      <View style={styles.center}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>
          {exercises.length === 0 ? '오늘 설정된 운동이 없어요' : '오늘의 손 힘 훈련을 마쳤어요'}
        </Text>
        {exercises.length > 0 && (
          <Text style={styles.completeSubtitle}>총 {totalRepsToday}회 완료했어요</Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.progress}>
        {index + 1} / {exercises.length}
      </Text>
      <Text style={styles.name}>
        {current.icon} {current.name}
      </Text>
      <Text style={styles.description}>{current.description}</Text>

      <VideoGuidePlayer videoUri={current.videoUri} posterIcon={current.icon} />

      <Text style={styles.painNotice}>통증이 느껴지면 즉시 멈추고 간호사에게 알려주세요</Text>

      <Text style={styles.repCount}>
        {completedReps} / {current.targetReps}회
      </Text>
      <BigButton label="한 번 더 했어요" onPress={handleRepDone} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  progress: {
    fontSize: 14,
    color: '#78909C',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#455A64',
    textAlign: 'center',
    marginBottom: 16,
  },
  painNotice: {
    fontSize: 14,
    color: '#C62828',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  repCount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  completeIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 18,
    color: '#455A64',
    textAlign: 'center',
  },
});
