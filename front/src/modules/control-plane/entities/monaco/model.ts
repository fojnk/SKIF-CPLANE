import { createEvent, createStore, sample } from 'effector';

import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';

export const FONT_SIZE_OPTIONS = [
  { value: '10px', content: '10px' },
  { value: '12px', content: '12px' },
  { value: '14px', content: '14px' },
  { value: '16px', content: '16px' },
  { value: '18px', content: '18px' },
  { value: '20px', content: '20px' },
] as const;

export const STORAGE_KEYS = {
  FONT_SIZE: 'monaco-editor-font-size',
  RENDER_SIDE_BY_SIDE: 'monaco-editor-render-side-by-side',
  COLLAPSE_UNCHANGED_REGIONS: 'monaco-editor-collapse-unchanged-regions',
} as const;

export const setFontSize = createEvent<string>();
export const setRenderSideBySide = createEvent<boolean>();
export const setCollapseUnchangedRegions = createEvent<boolean>();
export const $fontSize = createStore<string>('14px');
export const $renderSideBySide = createStore<boolean>(false);
export const $collapseUnchangedRegions = createStore<boolean>(true);

export const $fontSizeNumber = createStore<number>(14);

// Общие опции для Monaco Editor
export const getMonacoOptions = (
  readOnly: boolean = false,
  wordWrap: 'on' | 'off' = 'on',
) => ({
  stickyScroll: { enabled: false },
  renderLineHighlight: 'none' as const,
  minimap: { enabled: false },
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: true,
  automaticLayout: true,
  readOnly,
  wordWrap,
});

const initFontSize = createEvent();
const initRenderSideBySide = createEvent();
const initCollapseUnchangedRegions = createEvent();

sample({
  clock: initFontSize,
  fn: () => {
    const stored = getFromStorage<string>({
      type: 'local',
      key: STORAGE_KEYS.FONT_SIZE,
    });
    return stored ?? '14px';
  },
  target: $fontSize,
});

sample({
  clock: initRenderSideBySide,
  fn: () => {
    const stored = getFromStorage<boolean>({
      type: 'local',
      key: STORAGE_KEYS.RENDER_SIDE_BY_SIDE,
    });
    return stored ?? false;
  },
  target: $renderSideBySide,
});

sample({
  clock: initCollapseUnchangedRegions,
  fn: () => {
    const stored = getFromStorage<boolean>({
      type: 'local',
      key: STORAGE_KEYS.COLLAPSE_UNCHANGED_REGIONS,
    });
    return stored ?? true;
  },
  target: $collapseUnchangedRegions,
});

sample({
  clock: setFontSize,
  fn: (fontSize) => {
    setToStorage({
      type: 'local',
      key: STORAGE_KEYS.FONT_SIZE,
      value: fontSize,
    });
    return fontSize;
  },
  target: $fontSize,
});

sample({
  clock: $fontSize,
  fn: (fontSize) => {
    return Number(
      typeof fontSize === 'string' ? fontSize.replace('px', '') : '14',
    );
  },
  target: $fontSizeNumber,
});

sample({
  clock: setRenderSideBySide,
  fn: (renderSideBySide) => {
    setToStorage({
      type: 'local',
      key: STORAGE_KEYS.RENDER_SIDE_BY_SIDE,
      value: renderSideBySide,
    });
    return renderSideBySide;
  },
  target: $renderSideBySide,
});

sample({
  clock: setCollapseUnchangedRegions,
  fn: (collapseUnchangedRegions) => {
    setToStorage({
      type: 'local',
      key: STORAGE_KEYS.COLLAPSE_UNCHANGED_REGIONS,
      value: collapseUnchangedRegions,
    });
    return collapseUnchangedRegions;
  },
  target: $collapseUnchangedRegions,
});

// Инициализируем при импорте модели
initFontSize();
initRenderSideBySide();
initCollapseUnchangedRegions();
