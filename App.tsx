import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { MedicationScreen } from './src/screens/Medication/MedicationScreen';

// 1단계 검증용 임시 진입점 — 7단계에서 Home 화면 + 네비게이션으로 교체 예정.
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <MedicationScreen />
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
