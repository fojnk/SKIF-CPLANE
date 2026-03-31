// Режим удаления - показывает "Delete {name}?"
export type DeletePayload = {
  mode: 'delete';
  name: string;
  // Дополнительные данные для идентификации удаляемого объекта
  meta?: Record<string, unknown>;
};

// Режим подтверждения - показывает кастомный title и actionText
export type ConfirmPayload = {
  mode: 'confirm';
  title: string;
  actionText: string;
  // Дополнительные данные для идентификации действия
  meta?: Record<string, unknown>;
};

export type ActionConfirmPayload = DeletePayload | ConfirmPayload;
