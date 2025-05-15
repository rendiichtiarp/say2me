import React from 'react';
import { Message } from '../types';
import { motion } from 'framer-motion';

interface MessageCardProps {
  message: Message;
}

const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  // Format the timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    
    const formatter = new Intl.DateTimeFormat('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return formatter.format(date);
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 
        rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
      
      <div className="relative p-6 bg-white/90 backdrop-blur-xl rounded-2xl
        border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)]
        group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
        <motion.p 
          className="text-base sm:text-lg text-slate-700 leading-relaxed mb-4
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
              {formatDate(message.timestamp)}
            </time>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MessageCard;