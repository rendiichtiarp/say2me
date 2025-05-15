import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MessageForm from '../components/MessageForm';
import MessageList from '../components/MessageList';
import { Message } from '../types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ApiMessage {
  id: number;
  message_text: string;
  timestamp: string;
}

interface ErrorState {
  code: number;
  message: string;
}

const formatRelativeTime = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: id 
    });
  } catch {
    return 'Waktu tidak valid';
  }
};

const UserPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

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
      if (response.status === 429) {
        setError({
          code: 429,
          message: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.'
        });
        return;
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          setError({
            code: 404,
            message: `Maaf, halaman untuk username @${username} tidak ditemukan atau telah dihapus.`
          });
        } else {
          setError({
            code: response.status,
            message: 'Terjadi kesalahan saat memuat halaman.'
          });
        }
        return;
      }

      const { data } = await response.json();
      setUserId(data.id);
      setError(null);
    } catch {
      setError({
        code: 500,
        message: 'Terjadi kesalahan pada server.'
      });
    } finally {
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
          relativeTime: formatRelativeTime(msg.timestamp),
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
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      relativeTime: 'Baru saja',
      status: 'sending'
    };
    
    setMessages(prev => [tempMessage, ...prev]);
    
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
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'error' as const, error: errorMessage }
          : msg
      ));
      
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

  const ErrorDisplay = ({ error }: { error: ErrorState }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg mx-auto relative"
      >
        <div className="mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl 
              bg-slate-800/30 mb-6 border border-slate-700/30 backdrop-blur-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {error.code === 429 ? (
              <svg
                className="w-10 h-10 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
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
            )}
          </motion.div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
            {error.code === 429 ? 'Mohon Tunggu Sebentar' : 'Halaman Tidak Ditemukan'}
          </h1>
          <p className="text-slate-300/90 mb-8">
            {error.message}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl
                backdrop-blur-xl bg-slate-800/30 hover:bg-slate-800/50 text-slate-100 
                transition-all duration-300 border border-slate-700/30
                shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)]"
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
            {error.code === 429 && (
              <button
                onClick={() => fetchUserData()}
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl
                  bg-gradient-to-r from-blue-500/90 to-indigo-500/90 hover:from-blue-400/90 hover:to-indigo-400/90
                  text-white transition-all duration-300 backdrop-blur-sm
                  shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Coba Lagi
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 lg:py-16 sm:px-6 lg:px-8 relative">
        <div className="space-y-8 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 leading-tight py-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              @{username}
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-300/90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Kirim pesan anonim dan berbagi pikiran Anda untuk @{username}
            </motion.p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Link berhasil disalin!', {
                    duration: 2000,
                    position: 'top-center',
                    icon: '📋',
                    style: {
                      background: 'rgba(30, 41, 59, 0.8)',
                      backdropFilter: 'blur(10px)',
                      color: '#f8fafc',
                      borderRadius: '1rem',
                      border: '1px solid rgba(51, 65, 85, 0.3)'
                    }
                  });
                }}
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl
                  backdrop-blur-xl bg-slate-800/30 hover:bg-slate-800/50 text-slate-100 
                  transition-all duration-300 border border-slate-700/30
                  shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)]"
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  rotate: [0, -2, 2, -2, 0],
                }}
                transition={{
                  delay: 0.3,
                  rotate: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut"
                  }
                }}
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  className="group inline-flex items-center px-6 py-3 text-base font-medium rounded-xl
                    bg-gradient-to-r from-blue-500/90 to-indigo-500/90 hover:from-blue-400/90 hover:to-indigo-400/90
                    text-white transition-all duration-300 backdrop-blur-sm
                    shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                >
                  <svg
                    className="w-5 h-5 mr-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Dapatkan pesan untuk dirimu sendiri!
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="backdrop-blur-xl bg-slate-900/40 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
              overflow-hidden border border-slate-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6 sm:p-8 space-y-8">
              <MessageForm onSubmit={handleSubmitMessage} isLoading={isLoading} />
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center px-8" aria-hidden="true">
                  <div className="w-full border-t border-slate-700/30"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 backdrop-blur-xl bg-slate-900/40 text-sm font-medium text-slate-300/90
                    rounded-full border border-slate-700/30">
                    Pesan Terbaru
                  </span>
                </div>
              </div>

              <MessageList messages={messages} isLoading={isLoading} />
            </div>
            
            {hasMore && (
              <motion.div 
                className="flex justify-center p-6 backdrop-blur-xl bg-slate-900/30 border-t border-slate-700/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="group inline-flex items-center px-8 py-3 text-base font-medium rounded-xl
                    backdrop-blur-xl bg-slate-800/30 hover:bg-slate-800/50 text-slate-100 
                    transition-all duration-300 border border-slate-700/30
                    shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 sm:mt-16 mx-4 sm:mx-6 lg:mx-8 relative overflow-hidden rounded-3xl
          backdrop-blur-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 
          border border-blue-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      >
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent 
              bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
              Ingin Punya Halaman Seperti Ini?
            </h3>
            <p className="text-slate-300/90 text-base sm:text-lg">
              Buat halaman anonim Anda sendiri dan bagikan dengan teman-teman!
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="group inline-flex items-center px-6 py-3 text-base font-medium rounded-xl
                bg-gradient-to-r from-blue-500/90 to-indigo-500/90 hover:from-blue-400/90 hover:to-indigo-400/90
                text-white transition-all duration-300 backdrop-blur-sm
                shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]
                whitespace-nowrap"
            >
              <svg
                className="w-5 h-5 mr-2 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Dapatkan pesan untuk dirimu sendiri!
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserPage; 