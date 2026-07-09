import React, { useState } from 'react';
import { PinGateScreen } from './PinGateScreen';
import { CaregiverDashboardScreen } from './CaregiverDashboardScreen';

/** 환자용 화면과 분리된 진입점. PIN을 확인하기 전에는 대시보드 내용에 접근할 수 없다. */
export function CaregiverDashboardEntry() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PinGateScreen onUnlock={() => setUnlocked(true)} />;
  }
  return <CaregiverDashboardScreen />;
}
