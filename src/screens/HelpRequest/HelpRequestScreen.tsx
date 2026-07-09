import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { CountdownConfirmButton } from '../../components/CountdownConfirmButton';
import { vibrateNotification } from '../../services/haptics';
import { retryPendingHelpRequests, submitHelpRequest } from '../../services/helpRequestSync';

type ScreenState = 'idle' | 'sending' | 'sent' | 'error';

// 병실 정보는 선택 사항. 설정돼 있으면 도움 요청에 함께 실려간다.
const ROOM_INFO = process.env.EXPO_PUBLIC_ROOM_INFO || null;

export function HelpRequestScreen() {
  const [state, setState] = useState<ScreenState>('idle');

  useEffect(() => {
    // 이전 세션에서 못 보낸 요청이 있으면 조용히 재시도한다 (화면 상태는 건드리지 않음).
    void retryPendingHelpRequests();
  }, []);

  const handleConfirm = useCallback(async () => {
    setState('sending');
    const result = await submitHelpRequest(ROOM_INFO);
    if (result.ok) {
      await vibrateNotification();
      setState('sent');
    } else {
      setState('error');
    }
  }, []);

  if (state === 'sending') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.statusText}>전송 중이에요…</Text>
      </View>
    );
  }

  if (state === 'sent') {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.statusText}>전달했어요</Text>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.statusText}>
          전송에 실패했어요{'\n'}네트워크를 확인하고 다시 시도해주세요
        </Text>
        <BigButton label="다시 시도하기" variant="danger" onPress={() => setState('idle')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>도움이 필요하면 눌러주세요</Text>
      <CountdownConfirmButton idleLabel="도움 요청" onConfirm={handleConfirm} />
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
  },
  icon: {
    fontSize: 72,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});
