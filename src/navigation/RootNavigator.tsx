import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CaregiverDashboardEntry } from '../screens/CaregiverDashboard/CaregiverDashboardEntry';
import { CognitiveTrainingScreen } from '../screens/CognitiveTraining/CognitiveTrainingScreen';
import { HandExerciseScreen } from '../screens/HandExercise/HandExerciseScreen';
import { HelpRequestScreen } from '../screens/HelpRequest/HelpRequestScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { MedicationScreen } from '../screens/Medication/MedicationScreen';
import { MemoryTrainingScreen } from '../screens/MemoryTraining/MemoryTrainingScreen';

export type RootStackParamList = {
  Home: undefined;
  Medication: undefined;
  HelpRequest: undefined;
  CognitiveTraining: undefined;
  MemoryTraining: undefined;
  HandExercise: undefined;
  CaregiverDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Home에서 각 화면으로 한 번만 이동하고(depth 1), 그 화면들이 또 다른 화면으로
// 넘어가지 않도록 해서 네비게이션 깊이를 최대 2단계(Home → 기능 화면)로 제한한다.
export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerBackTitle: '뒤로' }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Medication" component={MedicationScreen} options={{ title: '복약' }} />
      <Stack.Screen
        name="HelpRequest"
        component={HelpRequestScreen}
        options={{ title: '도움 요청' }}
      />
      <Stack.Screen
        name="CognitiveTraining"
        component={CognitiveTrainingScreen}
        options={{ title: '인지훈련' }}
      />
      <Stack.Screen
        name="MemoryTraining"
        component={MemoryTrainingScreen}
        options={{ title: '기억력훈련' }}
      />
      <Stack.Screen
        name="HandExercise"
        component={HandExerciseScreen}
        options={{ title: '손힘훈련' }}
      />
      <Stack.Screen
        name="CaregiverDashboard"
        component={CaregiverDashboardEntry}
        options={{ title: '보호자 대시보드' }}
      />
    </Stack.Navigator>
  );
}
