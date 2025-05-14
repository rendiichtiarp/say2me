import { Message, ApiMessage, ApiResponse, ApiError } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class MessageServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: ApiError['details']
  ) {
    super(message);
    this.name = 'MessageServiceError';
  }
}

// Fungsi untuk membersihkan cache
const clearCache = async () => {
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
};

export const fetchMessages = async (page: number): Promise<Message[]> => {
  try {
    const response = await fetch(`${API_URL}/api/messages?page=${page}`);
    if (!response.ok) {
      const errorData = await response.json() as ApiError;
      throw new MessageServiceError(
        errorData.message || 'Gagal mengambil pesan',
        errorData.code,
        errorData.details
      );
    }
    
    const data = await response.json() as ApiResponse<ApiMessage[]>;
    return data.data.map(msg => ({
      id: msg.id.toString(),
      text: msg.message_text,
      timestamp: new Date(msg.timestamp).toISOString(),
      relativeTime: formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: id }),
      status: 'sent'
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    if (error instanceof MessageServiceError) {
      throw error;
    }
    throw new MessageServiceError(
      'Terjadi kesalahan saat mengambil pesan',
      'FETCH_ERROR'
    );
  }
};

export const postMessage = async (text: string): Promise<Message> => {
  try {
    // Bersihkan cache sebelum melakukan request
    await clearCache();

    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      // Pastikan request tidak menggunakan cache
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiError;
      throw new MessageServiceError(
        errorData.message || 'Gagal mengirim pesan',
        errorData.code,
        errorData.details
      );
    }
    
    const data = await response.json() as ApiResponse<ApiMessage>;
    return {
      id: data.data.id.toString(),
      text: data.data.message_text,
      timestamp: new Date(data.data.timestamp).toISOString(),
      relativeTime: formatDistanceToNow(new Date(data.data.timestamp), { addSuffix: true, locale: id }),
      status: 'sent'
    };
  } catch (error) {
    console.error('Error posting message:', error);
    if (error instanceof MessageServiceError) {
      throw error;
    }
    throw new MessageServiceError(
      'Terjadi kesalahan saat mengirim pesan',
      'POST_ERROR'
    );
  }
};