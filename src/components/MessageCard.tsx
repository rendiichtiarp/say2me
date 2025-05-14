import React from 'react';
import { Message } from '../types';

interface MessageCardProps {
  message: Message;
}

const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  // Format the timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return formatter.format(date);
  };

  return (
    <div className="message-card bg-white p-5 rounded-lg border border-gray-100 shadow-sm mb-4 transition-all duration-300 hover:shadow-md hover:border-gray-200 animate-fadeIn">
      <p className="text-gray-800 mb-3 whitespace-pre-wrap break-words">{message.text}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default MessageCard;