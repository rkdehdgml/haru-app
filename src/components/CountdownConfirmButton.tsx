import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { vibrateTap } from '../services/haptics';

export interface CountdownConfirmButtonProps {
  idleLabel: string;
  countingLabel?: (secondsLeft: number) => string;
  cancelLabel?: string;
  seconds?: number;
  onConfirm: () => void;
  disabled?: boolean;
}

type Phase = 'idle' | 'counting';

/**
 * 되돌리기 부담이 있는 동작을 위한 공용 확인 패턴: 탭 한 번 → n초 카운트다운 → 자동 확정.
 * 취소도 탭 한 번으로만 동작한다. 환자는 손 힘이 약해 롱프레스/스와이프를 쓸 수 없으므로
 * 이 컴포넌트는 onLongPress 등을 의도적으로 노출하지 않는다.
 * 도움 요청 외에 다른 위험 동작(예: 훈련 데이터 초기화)에도 재사용할 수 있게 범용으로 만들었다.
 */
export function CountdownConfirmButton({
  idleLabel,
  countingLabel = (s) => `${s}초 후 전송돼요 (취소하려면 여기를 다시 눌러주세요)`,
  cancelLabel = '취소',
  seconds = 3,
  onConfirm,
  disabled = false,
}: CountdownConfirmButtonProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    if (phase !== 'counting') return undefined;
    if (secondsLeft <= 0) {
      setPhase('idle');
      onConfirm();
      return undefined;
    }
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, secondsLeft, onConfirm]);

  const start = () => {
    void vibrateTap();
    setSecondsLeft(seconds);
    setPhase('counting');
  };

  const cancel = () => {
    void vibrateTap();
    setPhase('idle');
    setSecondsLeft(seconds);
  };

  if (phase === 'counting') {
    return (
      <View style={styles.countingWrap}>
        <Text style={styles.countdownNumber}>{secondsLeft}</Text>
        <Text style={styles.countingLabel}>{countingLabel(secondsLeft)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          onPress={cancel}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
        >
          <Text style={styles.cancelLabel}>{cancelLabel}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={idleLabel}
      disabled={disabled}
      onPress={start}
      style={({ pressed }) => [
        styles.idleButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.idleLabel}>{idleLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  idleButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  idleLabel: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  countingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 96,
    fontWeight: '800',
    color: '#C62828',
  },
  countingLabel: {
    fontSize: 18,
    color: '#455A64',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  cancelButton: {
    minHeight: 56,
    minWidth: 160,
    borderRadius: 16,
    backgroundColor: '#455A64',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cancelLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
});
