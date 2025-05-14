import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MessageForm from '../components/MessageForm';
import MessageList from '../components/MessageList';
import { Message } from '../types';
import toast from 'react-hot-toast';

interface ApiMessage {
  id: number;
  message_text: string;
  timestamp: string;
}

const UserPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (userId) {
      loadMessages();
    }
  }, [userId, page]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/pages/${username}`);
      if (!response.ok) {
        setNotFound(true);
        throw new Error('Halaman tidak ditemukan');
      }
      const { data } = await response.json();
      setUserId(data.id);
    } catch {
      setNotFound(true);
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${userId}?page=${page}`);
      if (!response.ok) throw new Error('Gagal memuat pesan');
      
      const { data } = await response.json();
      if (data.length === 0) {
        setHasMore(false);
      } else {
        const transformedMessages = data.map((msg: ApiMessage) => ({
          id: msg.id.toString(),
          text: msg.message_text,
          timestamp: new Date(msg.timestamp).toISOString(),
          status: 'sent'
        }));
        setMessages(prev => page === 1 ? transformedMessages : [...prev, ...transformedMessages]);
      }
    } catch {
      toast.error('Gagal memuat pesan', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMessage = async (text: string) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengirim pesan');
      }
      
      setPage(1);
      await loadMessages();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim pesan';
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }
      });
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const shareUrl = `${window.location.origin}/p/${username}`;

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto"
        >
          <div className="mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800/50 mb-6 border border-slate-700/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-100 mb-4">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-slate-400 mb-8">
              Maaf, halaman untuk username @{username} tidak ditemukan atau telah dihapus.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg
                bg-slate-800 hover:bg-slate-700 text-slate-100 
                transition-all duration-200 border border-slate-700"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 lg:py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl font-bold text-slate-100 mb-6 bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              @{username}
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Kirim pesan anonim dan berbagi pikiran Anda
            </motion.p>
            
            <motion.button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success('Link berhasil disalin!', {
                  duration: 2000,
                  position: 'top-center',
                  icon: '📋',
                  style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155'
                  }
                });
              }}
              className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl
                bg-slate-800/80 hover:bg-slate-800 text-slate-100 
                transition-all duration-200 border border-slate-700
                backdrop-blur-sm hover:border-slate-600 hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              Bagikan Link
            </motion.button>
          </motion.div>

          <motion.div 
            className="bg-slate-900/50 rounded-2xl shadow-lg overflow-hidden border border-slate-800
              backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6 sm:p-8 space-y-8">
              <MessageForm onSubmit={handleSubmitMessage} isLoading={isLoading} />
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center px-8" aria-hidden="true">
                  <div className="w-full border-t border-slate-800/50"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 bg-slate-900/90 text-sm font-medium text-slate-400
                    rounded-full border border-slate-800/50">
                    Pesan Terbaru
                  </span>
                </div>
              </div>

              <MessageList messages={messages} isLoading={isLoading} />
            </div>
            
            {hasMore && (
              <motion.div 
                className="flex justify-center p-6 bg-slate-900/30 border-t border-slate-800/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="group inline-flex items-center px-8 py-3 text-base font-medium rounded-xl
                    bg-slate-800/80 hover:bg-slate-800 text-slate-100 
                    transition-all duration-200 border border-slate-700
                    backdrop-blur-sm hover:border-slate-600
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memuat...
                    </>
                  ) : (
                    <>
                      Muat Lebih Banyak
                      <svg className="ml-2 -mr-1 h-5 w-5 transform group-hover:translate-x-1 transition-transform" 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserPage; 