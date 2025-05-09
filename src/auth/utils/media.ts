export const videoMimeTypes: string[] = [
  'video/mp4',
  'video/webm',
  'video/ogg',
];

export const imageMimeTypes: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const validateExtension = (file: { type: string }, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};
