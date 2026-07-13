import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton } from './src/components/BigButton';
import { CaregiverDashboardEntry } from './src/screens/CaregiverDashboard/CaregiverDashboardEntry';
import { CognitiveTrainingScreen } from './src/screens/CognitiveTraining/CognitiveTrainingScreen';
import { HandExerciseScreen } from './src/screens/HandExercise/HandExerciseScreen';
import { HelpRequestScreen } from './src/screens/HelpRequest/HelpRequestScreen';
import { MedicationScreen } from './src/screens/Medication/MedicationScreen';
import { MemoryTrainingScreen } from './src/screens/MemoryTraining/MemoryTrainingScreen';
import { recordAppOpened } from './src/services/activitySync';

type PreviewScreen =
  | 'medication'
  | 'helpRequest'
  | 'caregiver'
  | 'cognitive'
  | 'memory'
  | 'handExercise';

const SCREENS: { key: PreviewScreen; label: string }[] = [
  { key: 'medication', label: '복약 (1단계)' },
  { key: 'helpRequest', label: '도움요청 (2단계)' },
  { key: 'caregiver', label: '보호자대시보드 (3단계)' },
  { key: 'cognitive', label: '인지훈련 (5단계)' },
  { key: 'memory', label: '기억력훈련 (5단계)' },
  { key: 'handExercise', label: '손힘훈련 (6단계)' },
];

// 단계별 검증용 임시 진입점 — 7단계에서 Home 화면 + 네비게이션으로 교체하며 이 스위처는 제거할 예정.
export default function App() {
  const [screen, setScreen] = useState<PreviewScreen>('memory');

  useEffect(() => {
    // 실제 위치는 7단계에서 환자용 Home 화면 마운트 시점으로 옮길 예정.
    void recordAppOpened();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        horizontal
        style={styles.switcherScroll}
        contentContainerStyle={styles.switcher}
        showsHorizontalScrollIndicator={false}
      >
        {SCREENS.map((item) => (
          <View key={item.key} style={styles.switcherItem}>
            <BigButton
              label={item.label}
              variant={screen === item.key ? 'primary' : 'secondary'}
              onPress={() => setScreen(item.key)}
            />
          </View>
        ))}
      </ScrollView>
      <Text style={styles.devLabel}>개발용 화면 전환 (실제 앱에는 없음)</Text>

      <View style={styles.screenArea}>
        {screen === 'medication' && <MedicationScreen />}
        {screen === 'helpRequest' && <HelpRequestScreen />}
        {screen === 'caregiver' && <CaregiverDashboardEntry />}
        {screen === 'cognitive' && <CognitiveTrainingScreen />}
        {screen === 'memory' && <MemoryTrainingScreen />}
        {screen === 'handExercise' && <HandExerciseScreen />}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  switcherScroll: {
    flexGrow: 0,
  },
  switcher: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  switcherItem: {
    minWidth: 140,
  },
  devLabel: {
    fontSize: 11,
    color: '#B0BEC5',
    textAlign: 'center',
    marginTop: 2,
  },
  screenArea: {
    flex: 1,
  },
});
