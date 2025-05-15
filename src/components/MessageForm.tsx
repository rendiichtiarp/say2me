import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';

interface MessageFormProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSubmit, isLoading = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setText(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setText('');
      textareaRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative rounded-2xl overflow-hidden transition-all duration-300
        bg-slate-100/80 backdrop-blur-lg shadow-[inset_0_1px_1px_rgba(0,0,0,0.06)]
        hover:shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan Anda di sini..."
          className="w-full min-h-[120px] p-6 pb-16 bg-transparent text-slate-900 placeholder-slate-500
            text-base sm:text-lg border-0 focus:outline-none focus:ring-0 resize-none"
          disabled={isLoading}
        />

        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {text.length}/500
          </span>
          
          <motion.button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl
              bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
              hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500
              text-white transition-all duration-300 backdrop-blur-sm
              shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
              hover:scale-[1.02] active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim...
              </>
            ) : (
              <>
                Kirim
                <svg className="ml-2 -mr-1 h-5 w-5 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  );
};

export default MessageForm;