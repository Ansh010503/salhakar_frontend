import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ChatFeedbackButton = ({ messageId, onFeedbackSubmitted }) => {
  const { isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load existing feedback
  useEffect(() => {
    if (isAuthenticated && messageId) {
      loadFeedback();
    }
  }, [isAuthenticated, messageId]);

  const loadFeedback = async () => {
    if (!isAuthenticated || !messageId) return;
    
    setLoading(true);
    try {
      const response = await apiService.getChatMessageFeedback(messageId);
      if (response && response.user_feedback) {
        setUserRating(response.user_feedback.rating);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error loading chat feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = async (rating) => {
    if (!isAuthenticated) {
      return; // Don't show alert, just don't do anything
    }

    if (submitting) return;

    const newRating = userRating === rating ? null : rating; // Toggle if same rating clicked
    setUserRating(newRating);
    setSubmitting(true);

    try {
      await apiService.submitChatFeedback({
        message_id: messageId,
        rating: newRating
      });

      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting chat feedback:', error);
      // Revert rating on error
      setUserRating(userRating);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show feedback buttons if not authenticated
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <motion.button
        onClick={() => handleRatingClick('thumbs_up')}
        disabled={submitting || loading}
        whileHover={{ scale: submitting ? 1 : 1.1 }}
        whileTap={{ scale: submitting ? 1 : 0.9 }}
        className={`p-1.5 rounded-lg transition-all ${
          userRating === 'thumbs_up'
            ? 'bg-green-100'
            : 'bg-gray-100 hover:bg-gray-200'
        } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="Helpful"
      >
        {submitting && userRating === 'thumbs_up' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#10B981' }} />
        ) : (
          <ThumbsUp 
            className="w-3.5 h-3.5" 
            style={{ 
              color: userRating === 'thumbs_up' ? '#10B981' : '#8C969F',
              fill: userRating === 'thumbs_up' ? '#10B981' : 'none'
            }} 
          />
        )}
      </motion.button>

      <motion.button
        onClick={() => handleRatingClick('thumbs_down')}
        disabled={submitting || loading}
        whileHover={{ scale: submitting ? 1 : 1.1 }}
        whileTap={{ scale: submitting ? 1 : 0.9 }}
        className={`p-1.5 rounded-lg transition-all ${
          userRating === 'thumbs_down'
            ? 'bg-red-100'
            : 'bg-gray-100 hover:bg-gray-200'
        } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="Not Helpful"
      >
        {submitting && userRating === 'thumbs_down' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#EF4444' }} />
        ) : (
          <ThumbsDown 
            className="w-3.5 h-3.5" 
            style={{ 
              color: userRating === 'thumbs_down' ? '#EF4444' : '#8C969F',
              fill: userRating === 'thumbs_down' ? '#EF4444' : 'none'
            }} 
          />
        )}
      </motion.button>

      {submitted && userRating && (
        <span className="text-xs text-gray-500 ml-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
          ✓
        </span>
      )}
    </div>
  );
};

export default ChatFeedbackButton;

