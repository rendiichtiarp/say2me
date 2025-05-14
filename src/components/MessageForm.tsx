import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface MessageFormProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
}

const MAX_LENGTH = 500;

const MessageForm: React.FC<MessageFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setText('');
        textareaRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading && text.length <= MAX_LENGTH) {
      const toastId = toast.loading('Mengirim pesan...', {
        position: 'top-center',
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        },
      });

      try {
        await onSubmit(text.trim());
        setText('');
        textareaRef.current?.focus();
        toast.success('Pesan berhasil terkirim!', {
          id: toastId,
          duration: 3000,
          position: 'top-center',
          icon: '🎉',
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          },
        });
      } catch {
        toast.error('Gagal mengirim pesan. Silakan coba lagi.', {
          id: toastId,
          duration: 3000,
          position: 'top-center',
          icon: '❌',
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          },
        });
      }
    }
  };

  const getCharacterCountColor = () => {
    const length = text.length;
    if (length > MAX_LENGTH) return 'text-red-400';
    if (length > MAX_LENGTH * 0.8) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <motion.form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className="relative space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.label 
          htmlFor="message" 
          className="block text-base sm:text-lg font-medium text-slate-200 mb-2 sm:mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Bagikan Pikiran Anda
        </motion.label>
        
        <div className={`relative rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 
          ${isFocused 
            ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-blue-500/10' 
            : 'ring-1 ring-slate-700/50'
          }`}
        >
          <textarea
            ref={textareaRef}
            id="message"
            name="message"
            rows={4}
            className={`block w-full bg-slate-800/50 text-slate-100 text-base sm:text-lg caret-blue-500
              transition-all duration-200 resize-none p-4 sm:p-5 border-0
              focus:outline-none focus:ring-0 placeholder-slate-500
              selection:bg-blue-500/20 selection:text-slate-100
              backdrop-blur-sm leading-relaxed min-h-[120px] sm:min-h-[140px]`}
            placeholder="Ketik pesan Anda di sini..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            maxLength={1000}
          />
          
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center space-x-2 sm:space-x-3">
            <div className={`text-xs sm:text-sm font-medium ${getCharacterCountColor()}`}>
              {text.length}/{MAX_LENGTH}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Tekan Esc untuk menghapus</span>
        </motion.div>
        
        <motion.button
          type="submit"
          disabled={!text.trim() || isLoading || text.length > MAX_LENGTH}
          className={`w-full sm:w-auto relative group inline-flex items-center justify-center 
            px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl
            transition-all duration-200 
            ${!text.trim() || text.length > MAX_LENGTH
              ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30'
            }`}
          whileHover={!isLoading && text.trim() && text.length <= MAX_LENGTH ? { scale: 1.02 } : undefined}
          whileTap={!isLoading && text.trim() && text.length <= MAX_LENGTH ? { scale: 0.98 } : undefined}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="truncate">Mengirim...</span>
            </>
          ) : (
            <>
              <span className="truncate">Kirim Pesan</span>
              <svg
                className="ml-2 -mr-1 w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default MessageForm;