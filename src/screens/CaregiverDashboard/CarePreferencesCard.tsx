import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { DashboardCard } from '../../components/DashboardCard';
import { getCarePreferences, saveCarePreferences } from '../../services/storage/carePreferencesStorage';

/**
 * 인지훈련(장소 맞히기)·기억력훈련(담당 의료진 회상) 문제를 만드는 데 쓰이는
 * 환자 프로필 정보. 같은 기기에서 쓰는 걸 전제로 로컬에만 저장한다.
 */
export function CarePreferencesCard() {
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const prefs = await getCarePreferences();
      setHospitalName(prefs.hospitalName);
      setDoctorName(prefs.doctorName);
    })();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    await saveCarePreferences({ hospitalName: hospitalName.trim(), doctorName: doctorName.trim() });
    setSaving(false);
    setSaved(true);
  }, [hospitalName, doctorName]);

  return (
    <DashboardCard title="환자 정보 설정">
      <Text style={styles.label}>병원 이름</Text>
      <TextInput
        style={styles.input}
        value={hospitalName}
        onChangeText={setHospitalName}
        placeholder="예: 서울아산병원"
      />
      <Text style={styles.label}>담당 의사 성함</Text>
      <TextInput
        style={styles.input}
        value={doctorName}
        onChangeText={setDoctorName}
        placeholder="예: 김도윤"
      />
      <BigButton label={saving ? '저장 중...' : '저장'} onPress={handleSave} disabled={saving} />
      {saved && <Text style={styles.savedText}>저장했어요</Text>}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#455A64',
    marginTop: 4,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  savedText: {
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
});
