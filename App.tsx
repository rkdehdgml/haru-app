import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { HelpRequestScreen } from './src/screens/HelpRequest/HelpRequestScreen';

// 단계별 검증용 임시 진입점 — 7단계에서 Home 화면 + 네비게이션으로 교체 예정.
// (1단계 MedicationScreen 검증은 완료했고, 지금은 2단계 HelpRequestScreen을 확인 중)
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <HelpRequestScreen />
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
