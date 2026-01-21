import { ChatMessage, ChatThread } from '@/types/chat';

export const mockChatThread: ChatThread = {
  id: 'thread-123',
  client_id: 'mock-user-uuid-12345',
  unread_count_client: 2,
  unread_count_coach: 0,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-20T14:30:00Z',
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    thread_id: 'thread-123',
    sender_id: 'mock-user-uuid-12345',
    sender_type: 'client',
    content: 'Coach, tengo una duda sobre este ejercicio. No estoy seguro de la técnica correcta.',
    reference_tag: '[Semana 1 - Día 3: Push Day > Press de Banca]',
    reference_type: 'exercise',
    reference_id: 'exercise-bench-press',
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'msg-2',
    thread_id: 'thread-123',
    sender_id: 'coach-uuid-456',
    sender_type: 'coach',
    content: 'Claro! Asegúrate de mantener los codos a 45 grados del cuerpo, no perpendiculares. Esto protege tus hombros y maximiza la activación del pecho.',
    created_at: '2026-01-20T10:05:00Z',
    read_at: '2026-01-20T10:06:00Z',
  },
  {
    id: 'msg-3',
    thread_id: 'thread-123',
    sender_id: 'mock-user-uuid-12345',
    sender_type: 'client',
    content: 'Perfecto, gracias! Y respecto al almuerzo de hoy, ¿puedo cambiar el arroz por quinoa?',
    reference_tag: '[13:00 - Almuerzo]',
    reference_type: 'meal',
    reference_id: 'meal-lunch-1',
    created_at: '2026-01-20T12:30:00Z',
  },
  {
    id: 'msg-4',
    thread_id: 'thread-123',
    sender_id: 'coach-uuid-456',
    sender_type: 'coach',
    content: 'Sí, la quinoa es excelente alternativa. Tiene más proteína que el arroz y es buen carbohidrato complejo. Mantén la misma cantidad (150g cocida).',
    created_at: '2026-01-20T12:35:00Z',
  },
  {
    id: 'msg-5',
    thread_id: 'thread-123',
    sender_id: 'mock-user-uuid-12345',
    sender_type: 'client',
    content: '¿Cómo me ves para la semana 2?',
    reference_tag: '[Semana 2 - General]',
    reference_type: 'workout',
    reference_id: 'workout-week-2',
    created_at: '2026-01-20T14:00:00Z',
  },
];

// Empty thread for testing initial state
export const mockEmptyThread: ChatThread = {
  id: 'thread-empty',
  client_id: 'mock-user-uuid-12345',
  unread_count_client: 0,
  unread_count_coach: 0,
  created_at: '2026-01-20T10:00:00Z',
  updated_at: '2026-01-20T10:00:00Z',
};

// Helper to create a new mock message
export const createMockMessage = (
  partial: Partial<ChatMessage> & { content: string }
): ChatMessage => ({
  id: `msg-${Date.now()}`,
  thread_id: 'thread-123',
  sender_id: 'mock-user-uuid-12345',
  sender_type: 'client',
  created_at: new Date().toISOString(),
  ...partial,
});
