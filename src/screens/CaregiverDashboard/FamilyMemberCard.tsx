import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { CountdownConfirmButton } from '../../components/CountdownConfirmButton';
import { DashboardCard } from '../../components/DashboardCard';
import { generateId } from '../../services/id';
import { deleteFamilyPhoto, saveFamilyPhoto } from '../../services/photoStorage';
import {
  addFamilyMember,
  deleteFamilyMember,
  getFamilyMembers,
} from '../../services/storage/familyMemberStorage';
import type { FamilyMember } from '../../types/familyMember';

/**
 * 가족 사진/이름 등록. 보호자와 환자가 같은 기기를 쓰는 걸 전제로, 사진은
 * Firebase Storage 없이 기기 안에 로컬로만 저장한다 (5단계 기억력훈련의 가족 사진
 * 회상 문제가 이 데이터를 사용).
 */
export function FamilyMemberCard() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setMembers(await getFamilyMembers());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePickPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!pickedUri || name.trim().length === 0) return;
    setSaving(true);
    const savedUri = await saveFamilyPhoto(pickedUri, generateId());
    await addFamilyMember(name.trim(), savedUri);
    setName('');
    setPickedUri(null);
    setSaving(false);
    void load();
  }, [pickedUri, name, load]);

  const handleDelete = useCallback(
    async (member: FamilyMember) => {
      await deleteFamilyMember(member.id);
      deleteFamilyPhoto(member.photoUri);
      void load();
    },
    [load]
  );

  return (
    <DashboardCard title="가족 사진 등록">
      {members.map((member) => (
        <View key={member.id} style={styles.memberRow}>
          <Image source={{ uri: member.photoUri }} style={styles.thumbnail} />
          <Text style={styles.memberName}>{member.name}</Text>
          <CountdownConfirmButton idleLabel="삭제" seconds={3} onConfirm={() => handleDelete(member)} />
        </View>
      ))}

      <View style={styles.form}>
        {pickedUri ? (
          <Image source={{ uri: pickedUri }} style={styles.preview} />
        ) : (
          <BigButton label="사진 선택" variant="secondary" onPress={handlePickPhoto} />
        )}
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="이름 (예: 큰딸)"
        />
        <BigButton
          label={saving ? '저장 중...' : '등록'}
          onPress={handleSave}
          disabled={saving || !pickedUri || name.trim().length === 0}
        />
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    marginTop: 8,
    gap: 12,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
});
