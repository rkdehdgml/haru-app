import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '../../components/BigButton';

const CAREGIVER_PIN = process.env.EXPO_PUBLIC_CAREGIVER_PIN;

export interface PinGateScreenProps {
  onUnlock: () => void;
}

/**
 * 환자용 화면과 명확히 분리하기 위한 최소한의 역할 구분 장치.
 * 주의: 실제 보안 경계는 아니다 — EXPO_PUBLIC_* 값은 앱 번들에 그대로 노출된다.
 * 목적은 인지저하가 있는 환자가 실수로 보호자 화면에 들어오는 걸 막는 것이고,
 * Firestore 데이터 자체의 접근 제어는 Firestore 보안 규칙에서 별도로 관리해야 한다.
 */
export function PinGateScreen({ onUnlock }: PinGateScreenProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (!CAREGIVER_PIN) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          보호자 PIN이 설정되지 않았어요.{'\n'}.env 파일의 EXPO_PUBLIC_CAREGIVER_PIN 값을
          채워주세요.
        </Text>
      </View>
    );
  }

  const handleSubmit = () => {
    if (input === CAREGIVER_PIN) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>보호자 확인</Text>
      <Text style={styles.subtitle}>보호자 PIN을 입력해주세요</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={(text) => {
          setInput(text);
          setError(false);
        }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
        accessibilityLabel="보호자 PIN 입력"
      />
      {error && <Text style={styles.error}>PIN이 올바르지 않아요</Text>}
      <BigButton label="확인" onPress={handleSubmit} disabled={input.length === 0} />
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#455A64',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#455A64',
    textAlign: 'center',
  },
  error: {
    color: '#C62828',
    marginBottom: 16,
    textAlign: 'center',
  },
});
