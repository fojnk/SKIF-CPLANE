import { ParamsStringTypeDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';

// Используем ParamsStringTypeDC из data-contracts, но добавляем 'yaml' для обратной совместимости
// (если он всё ещё используется где-то)
export type ConstraintType = ParamsStringTypeDC | 'yaml';
