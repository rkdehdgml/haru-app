import { Directory, File, Paths } from 'expo-file-system';

const FAMILY_PHOTOS_DIR_NAME = 'family-photos';

function getFamilyPhotosDirectory(): Directory {
  const dir = new Directory(Paths.document, FAMILY_PHOTOS_DIR_NAME);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

/**
 * expo-image-picker가 반환하는 URI는 캐시 영역이라 시스템이 지울 수 있다.
 * 앱 문서 디렉터리로 복사해서 영구 보관하고, 그 경로를 SQLite에 저장한다.
 */
export async function saveFamilyPhoto(pickedUri: string, memberId: string): Promise<string> {
  const dir = getFamilyPhotosDirectory();
  const sourceFile = new File(pickedUri);
  const destFile = new File(dir, `${memberId}${sourceFile.extension || '.jpg'}`);
  await sourceFile.copy(destFile);
  return destFile.uri;
}

export function deleteFamilyPhoto(photoUri: string): void {
  try {
    const file = new File(photoUri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('[photoStorage] 사진 삭제 실패', error);
  }
}
