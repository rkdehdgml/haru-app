import { getDb } from './db';
import { generateId } from '../id';
import type { FamilyMember } from '../../types/familyMember';

export async function addFamilyMember(name: string, photoUri: string): Promise<FamilyMember> {
  const db = await getDb();
  const member: FamilyMember = {
    id: generateId(),
    name,
    photoUri,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(`INSERT INTO family_members (id, name, photoUri, createdAt) VALUES (?, ?, ?, ?);`, [
    member.id,
    member.name,
    member.photoUri,
    member.createdAt,
  ]);
  return member;
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const db = await getDb();
  return db.getAllAsync<FamilyMember>(`SELECT * FROM family_members ORDER BY createdAt ASC;`);
}

export async function deleteFamilyMember(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM family_members WHERE id = ?;`, [id]);
}
