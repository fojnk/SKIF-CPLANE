export const downloadFile = ({
  data,
  name = 'blob',
}: {
  data: Blob;
  name?: string;
}) => {
  const file = new File([data], name, {
    type: 'application/octet-stream',
  });

  const href = URL.createObjectURL(file);

  const a = document.createElement('a');
  a.href = href;
  a.setAttribute('download', name);
  a.click();
  a.remove();
};

export const downloadUrlFile = ({
  href,
  name,
}: {
  href: string;
  name: string;
}) => {
  const a = document.createElement('a');
  a.href = href;
  a.setAttribute('target', '_blank');
  a.setAttribute('download', name);
  a.click();
  a.remove();
};

import { customAlphabet } from 'nanoid';

const RANDOM_STRING_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const createRandomString = (length: number = 32) => {
  const nanoid = customAlphabet(RANDOM_STRING_ALPHABET, length);
  return nanoid();
};
