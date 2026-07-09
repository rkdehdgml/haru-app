import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { CaregiverDashboardEntry } from './src/screens/CaregiverDashboard/CaregiverDashboardEntry';
import { recordAppOpened } from './src/services/activitySync';

// 단계별 검증용 임시 진입점 — 7단계에서 Home 화면 + 네비게이션으로 교체 예정.
// (1단계 MedicationScreen, 2단계 HelpRequestScreen 검증은 완료했고, 지금은 3단계
// CaregiverDashboardEntry를 확인 중)
export default function App() {
  useEffect(() => {
    // 실제 위치는 7단계에서 환자용 Home 화면 마운트 시점으로 옮길 예정.
    void recordAppOpened();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <CaregiverDashboardEntry />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
