export interface Message {
  id: string;
  text: string;
  timestamp: string;
  relativeTime: string;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
}

export interface ApiMessage {
  id: number;
  message_text: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: {
    field?: string;
    value?: string | number;
    constraint?: string;
  };
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';