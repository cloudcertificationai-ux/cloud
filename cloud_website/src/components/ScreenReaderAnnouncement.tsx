'use client';

import { useEffect, useState } from 'react';
import { ariaUtils } from '@/lib/accessibility-utils';

interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

export default function ScreenReaderAnnouncement({ 
  message, 
  priority = 'polite', 
  clearAfter = 5000 
}: ScreenReaderAnnouncementProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);
    
    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);
      
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  if (!currentMessage) return null;

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {currentMessage}
    </div>
  );
}