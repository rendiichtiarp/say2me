import React from 'react';
import { Message } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
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
            className="animate-pulse bg-slate-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 
              shadow-sm border border-slate-700/50"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-slate-700/50 rounded-full w-3/4"></div>
              <div className="h-3 sm:h-4 bg-slate-700/50 rounded-full w-1/2"></div>
              <div className="h-3 sm:h-4 bg-slate-700/50 rounded-full w-5/6"></div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center space-x-2">
              <div className="h-3 sm:h-4 w-3 sm:w-4 bg-slate-700/50 rounded-full"></div>
              <div className="h-2.5 sm:h-3 bg-slate-700/50 rounded-full w-20 sm:w-24"></div>
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
            className="group relative bg-slate-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 
              shadow-sm hover:shadow-md transition-all duration-300 border border-slate-700/50
              hover:bg-slate-800/70 hover:border-slate-600/50
              before:absolute before:inset-0 before:rounded-lg sm:before:rounded-xl 
              before:bg-gradient-to-r before:from-blue-500/5 before:to-indigo-500/5 
              before:opacity-0 before:transition-opacity hover:before:opacity-100"
          >
            <motion.p 
              className="relative text-sm sm:text-base text-slate-100 leading-relaxed mb-3 sm:mb-4
                whitespace-pre-wrap break-words"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {message.text}
            </motion.p>
            <motion.div 
              className="relative flex items-center text-xs sm:text-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0 text-slate-500"
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
                title={message.timestamp}
                className="font-medium"
              >
                {formatRelativeTime(message.timestamp)}
              </time>
            </motion.div>
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
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 
              rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 
              mb-6 sm:mb-8 border border-slate-700/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400"
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
            className="text-xl sm:text-2xl font-semibold text-slate-100 mb-2 sm:mb-3
              bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Belum Ada Pesan
          </motion.p>
          <motion.p 
            className="text-base sm:text-lg text-slate-400"
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