import { createEvent, createStore } from 'effector';

// ============================================================================
// Expanded Cubes (управление раскрытыми disclosure)
// ============================================================================
// Это единственное состояние, которое не хранится в форме —
// UI состояние для раскрытия/сворачивания кубов

// События для управления раскрытыми кубами
export const expandCube = createEvent<string>();
export const collapseCube = createEvent<string>();
export const toggleCube = createEvent<string>();
export const openOnlyCube = createEvent<string>();

// Стор с хешами раскрытых кубов
export const $expandedCubeHashes = createStore<Set<string>>(new Set())
  .on(expandCube, (state, hash) => {
    // Добавляем только если его нет
    if (state.has(hash)) return state;
    const next = new Set(state);
    next.add(hash);
    return next;
  })
  .on(collapseCube, (state, hash) => {
    if (!state.has(hash)) return state;
    const next = new Set(state);
    next.delete(hash);
    return next;
  })
  .on(toggleCube, (state, hash) => {
    const next = new Set(state);
    if (next.has(hash)) {
      next.delete(hash);
    } else {
      next.add(hash);
    }
    return next;
  })
  .on(openOnlyCube, (_, hash) => new Set([hash]));
