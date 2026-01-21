// Chat types for the application
// These match the Supabase schema for chat_messages and chat_threads tables

export type ChatReferenceType = 'workout' | 'nutrition' | 'exercise' | 'meal' | 'general';

export type ChatSenderType = 'client' | 'coach';

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: ChatSenderType;
  content: string;
  image_url?: string;
  reference_tag?: string; // "[Día 3 - Push Day]" or "[Almuerzo - 13:00]"
  reference_type?: ChatReferenceType;
  reference_id?: string;
  created_at: string;
  read_at?: string;
}

export interface ChatThread {
  id: string;
  client_id: string;
  last_message_at?: string;
  unread_count_client: number;
  unread_count_coach: number;
  created_at: string;
  updated_at: string;
}

// Database row types (for Supabase responses)
export interface ChatMessageRow {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: ChatSenderType;
  content: string;
  image_url: string | null;
  reference_tag: string | null;
  reference_type: ChatReferenceType | null;
  reference_id: string | null;
  created_at: string;
  read_at: string | null;
}

export interface ChatThreadRow {
  id: string;
  client_id: string;
  last_message_at: string | null;
  unread_count_client: number;
  unread_count_coach: number;
  created_at: string;
  updated_at: string;
}

// Helper to convert row to domain type
export function chatMessageFromRow(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    thread_id: row.thread_id,
    sender_id: row.sender_id,
    sender_type: row.sender_type,
    content: row.content,
    image_url: row.image_url ?? undefined,
    reference_tag: row.reference_tag ?? undefined,
    reference_type: row.reference_type ?? undefined,
    reference_id: row.reference_id ?? undefined,
    created_at: row.created_at,
    read_at: row.read_at ?? undefined,
  };
}

export function chatThreadFromRow(row: ChatThreadRow): ChatThread {
  return {
    id: row.id,
    client_id: row.client_id,
    last_message_at: row.last_message_at ?? undefined,
    unread_count_client: row.unread_count_client,
    unread_count_coach: row.unread_count_coach,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
