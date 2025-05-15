import React from 'react';
import { Message } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const formatRelativeTime = (timestamp: string | undefined) => {
  if (!timestamp) return 'waktu tidak diketahui';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return 'waktu tidak valid';
    }
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 5) return 'baru saja';
    if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} minggu yang lalu`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} bulan yang lalu`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} tahun yang lalu`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'waktu tidak valid';
  }
};

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 
              rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
            <div className="relative p-6 bg-white/90 backdrop-blur-xl rounded-2xl
              border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200/80 rounded-full w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-200/80 rounded-full w-1/2 animate-pulse" />
                <div className="h-4 bg-slate-200/80 rounded-full w-5/6 animate-pulse" />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <div className="h-4 w-4 bg-slate-200/80 rounded-full animate-pulse" />
                <div className="h-3 bg-slate-200/80 rounded-full w-24 animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            layout
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 
              rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
            <div className="relative p-6 bg-white/90 backdrop-blur-xl rounded-2xl
              border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)]
              group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
              <motion.p 
                className="relative text-base sm:text-lg text-slate-700 leading-relaxed mb-4
                  whitespace-pre-wrap break-words"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {message.text}
              </motion.p>
              
              <motion.div 
                className="flex items-center justify-between text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 flex-shrink-0 text-slate-400"
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
                  <time 
                    dateTime={message.timestamp}
                    className="font-medium"
                  >
                    {formatRelativeTime(message.timestamp)}
                  </time>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {messages.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="text-center py-12 sm:py-16"
        >
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl 
              bg-gradient-to-br from-slate-100 to-slate-200 backdrop-blur-xl
              mb-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </motion.div>
          <motion.p 
            className="text-2xl sm:text-3xl font-semibold bg-clip-text text-transparent 
              bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Belum Ada Pesan
          </motion.p>
          <motion.p 
            className="text-lg text-slate-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Jadilah yang pertama berbagi pikiran Anda!
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MessageList;