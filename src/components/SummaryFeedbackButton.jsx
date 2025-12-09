import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SummaryFeedbackButton = ({ referenceType, referenceId, onFeedbackSubmitted }) => {
  const { isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load existing feedback and statistics
  useEffect(() => {
    if (isAuthenticated && referenceType && referenceId) {
      loadFeedback();
    }
  }, [isAuthenticated, referenceType, referenceId]);

  const loadFeedback = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await apiService.getSummaryFeedback(referenceType, referenceId);
      if (response) {
        if (response.user_feedback) {
          setUserRating(response.user_feedback.rating);
          setFeedbackText(response.user_feedback.feedback_text || '');
          setSubmitted(true);
        }
        if (response.statistics) {
          setStatistics(response.statistics);
        }
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = async (rating) => {
    if (!isAuthenticated) {
      alert('Please login to provide feedback');
      return;
    }

    if (submitting) return;

    const newRating = userRating === rating ? null : rating; // Toggle if same rating clicked
    setUserRating(newRating);
    setSubmitting(true);

    try {
      await apiService.submitSummaryFeedback({
        reference_type: referenceType,
        reference_id: referenceId,
        rating: newRating,
        feedback_text: feedbackText || null
      });

      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
      
      // Reload feedback to get updated statistics
      await loadFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Revert rating on error
      setUserRating(userRating);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!isAuthenticated) {
      alert('Please login to provide feedback');
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      await apiService.submitSummaryFeedback({
        reference_type: referenceType,
        reference_id: referenceId,
        rating: userRating,
        feedback_text: feedbackText || null
      });

      setSubmitted(true);
      setShowTextInput(false);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
      
      // Reload feedback
      await loadFeedback();
    } catch (error) {
      console.error('Error submitting text feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show feedback buttons if not authenticated
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Was this summary helpful?
        </p>
        {statistics && statistics.total_feedback > 0 && (
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {statistics.thumbs_up_count} of {statistics.total_feedback} found this helpful
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Thumbs Up Button */}
        <motion.button
          onClick={() => handleRatingClick('thumbs_up')}
          disabled={submitting || loading}
          whileHover={{ scale: submitting ? 1 : 1.05 }}
          whileTap={{ scale: submitting ? 1 : 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            userRating === 'thumbs_up'
              ? 'bg-green-100 border-2 border-green-500'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
          } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {submitting && userRating === 'thumbs_up' ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#10B981' }} />
          ) : (
            <ThumbsUp 
              className="w-4 h-4" 
              style={{ 
                color: userRating === 'thumbs_up' ? '#10B981' : '#8C969F',
                fill: userRating === 'thumbs_up' ? '#10B981' : 'none'
              }} 
            />
          )}
          <span 
            className="text-sm font-medium"
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              color: userRating === 'thumbs_up' ? '#10B981' : '#8C969F'
            }}
          >
            Helpful
          </span>
        </motion.button>

        {/* Thumbs Down Button */}
        <motion.button
          onClick={() => handleRatingClick('thumbs_down')}
          disabled={submitting || loading}
          whileHover={{ scale: submitting ? 1 : 1.05 }}
          whileTap={{ scale: submitting ? 1 : 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            userRating === 'thumbs_down'
              ? 'bg-red-100 border-2 border-red-500'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
          } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {submitting && userRating === 'thumbs_down' ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#EF4444' }} />
          ) : (
            <ThumbsDown 
              className="w-4 h-4" 
              style={{ 
                color: userRating === 'thumbs_down' ? '#EF4444' : '#8C969F',
                fill: userRating === 'thumbs_down' ? '#EF4444' : 'none'
              }} 
            />
          )}
          <span 
            className="text-sm font-medium"
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              color: userRating === 'thumbs_down' ? '#EF4444' : '#8C969F'
            }}
          >
            Not Helpful
          </span>
        </motion.button>

        {/* Text Feedback Button */}
        <motion.button
          onClick={() => setShowTextInput(!showTextInput)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border-2 border-transparent hover:bg-gray-100 transition-all"
        >
          <MessageSquare className="w-4 h-4" style={{ color: '#8C969F' }} />
          <span 
            className="text-sm font-medium text-gray-600"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Add Comment
          </span>
        </motion.button>
      </div>

      {/* Text Feedback Input */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <div className="relative">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about this summary (optional)..."
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px'
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackText.length}/2000 characters
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowTextInput(false);
                      setFeedbackText('');
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTextSubmit}
                    disabled={submitting}
                    className="px-4 py-1.5 text-sm text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      fontFamily: 'Roboto, sans-serif',
                      backgroundColor: '#1E65AD'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {submitted && !showTextInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-xs text-green-600"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            ✓ Thank you for your feedback!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SummaryFeedbackButton;

