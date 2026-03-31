import { getFromStorage } from '@/shared/lib/common/storage';

export const getNumericId = (id: string | null) => {
  if (id === null) {
    return null;
  }
  const numericId = Number(id);
  return isNaN(numericId) ? null : numericId;
};

export const getStorageId = (name: string) => {
  const id = getFromStorage({
    type: 'local',
    key: name,
  }) as string;
  return getNumericId(id);
};
