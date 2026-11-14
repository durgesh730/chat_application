import React, { useState, useEffect, useCallback } from 'react';
import fetcher from '../../helper/fetcher';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';

const AiReplySuggestions = ({ receiverId, partnerHandle, onSelectReply, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);
  const [consentStatus, setConsentStatus] = useState({
    userConsented: false,
    partnerConsented: false,
    mutualConsent: false,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  // 1. Fetch Consent Status
  const checkConsent = useCallback(async () => {
    if (!receiverId) return;
    setConsentLoading(true);
    setError(null);
    try {
      const res = await fetcher.get('/ai/consent', {
        params: { receiverId },
      });
      if (res.data?.success) {
        setConsentStatus(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      console.error('Error checking AI consent:', err);
      setError('Could not verify AI consent status.');
    } finally {
      setConsentLoading(false);
    }
    return null;
  }, [receiverId]);

  // 2. Fetch Suggestions from Backend (which pulls latest 20 messages from MongoDB)
  const fetchSuggestions = useCallback(async () => {
    if (!receiverId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher.post('/ai/suggest-replies', {
        conversationId: receiverId,
      });
      if (res.data?.success && Array.isArray(res.data.suggestions)) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.error('Error fetching reply suggestions:', err);
      if (err.response?.status === 403 && err.response?.data?.requiresConsent) {
        setConsentStatus({
          userConsented: Boolean(err.response.data.userConsented),
          partnerConsented: Boolean(err.response.data.partnerConsented),
          mutualConsent: false,
        });
      } else {
        setError(
          err.response?.data?.message ||
            'Could not generate reply suggestions. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [receiverId]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    checkConsent().then((status) => {
      if (isMounted && status?.mutualConsent) {
        fetchSuggestions();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [checkConsent, fetchSuggestions]);

  // Toggle user's consent
  const handleToggleConsent = async (optIn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher.post('/ai/consent', {
        receiverId,
        consent: optIn,
      });
      if (res.data?.success) {
        setConsentStatus(res.data.data);
        if (res.data.data.mutualConsent) {
          fetchSuggestions();
        } else {
          setSuggestions([]);
        }
      }
    } catch (err) {
      console.error('Error updating consent:', err);
      setError('Failed to update consent.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickReply = (text) => {
    onSelectReply(text);
    onClose();
  };

  return (
    <div className="absolute bottom-16 right-2 sm:right-4 z-40 w-80 sm:w-[410px] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-100 p-3.5 animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-2.5">
        <div className="flex items-center space-x-1.5">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <QuickreplyOutlinedIcon sx={{ fontSize: 14 }} />
          </span>
          <span className="text-xs font-bold text-gray-800 tracking-tight">
            AI Reply Suggestions
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {consentStatus.mutualConsent && !loading && (
            <button
              type="button"
              onClick={fetchSuggestions}
              className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Regenerate suggestions"
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-2.5 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Initial Loading */}
      {(consentLoading || loading) && (
        <div className="py-6 flex flex-col items-center justify-center space-y-2">
          <CircularProgress size={24} sx={{ color: '#6366f1' }} />
          <p className="text-xs font-medium text-gray-600">
            {consentLoading ? 'Checking consent status...' : 'Analyzing conversation with Gemini...'}
          </p>
        </div>
      )}

      {/* MUTUAL CONSENT WALL (If either participant has not consented) */}
      {!consentLoading && !loading && !consentStatus.mutualConsent && (
        <div className="space-y-3 p-1">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-left">
            <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs mb-1">
              <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
              <span>Participant Privacy Consent</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              AI Reply Suggestions analyzes the last 20 messages of this chat using Google Gemini.
              To protect your privacy, <strong>both participants must opt in</strong> before shared chat history is sent.
            </p>
          </div>

          {/* Consent Status Grid */}
          <div className="space-y-1.5 text-xs">
            {/* User's Consent */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Your Consent</span>
              {consentStatus.userConsented ? (
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircleIcon sx={{ fontSize: 14 }} />
                  <span>Opted In</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleConsent(true)}
                  className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Opt In
                </button>
              )}
            </div>

            {/* Partner's Consent */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">{partnerHandle}'s Consent</span>
              {consentStatus.partnerConsented ? (
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircleIcon sx={{ fontSize: 14 }} />
                  <span>Opted In</span>
                </span>
              ) : (
                <span className="text-amber-600 font-medium text-[11px]">
                  Pending Opt-in ⏳
                </span>
              )}
            </div>
          </div>

          {/* Revoke button if user already opted in */}
          {consentStatus.userConsented && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => handleToggleConsent(false)}
                className="text-[11px] text-gray-400 hover:text-red-600 underline transition-colors"
              >
                Revoke my consent
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3 SUGGESTIONS DISPLAY (When mutual consent is active) */}
      {!consentLoading && !loading && consentStatus.mutualConsent && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400 px-1">
            Click any suggestion to insert into input:
          </p>

          <div className="space-y-1.5">
            {suggestions.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePickReply(item)}
                className="w-full p-2.5 bg-gray-50 hover:bg-indigo-50/80 border border-gray-150 hover:border-indigo-300 rounded-xl text-left transition-all group flex items-start justify-between space-x-2"
              >
                <div className="flex items-start space-x-2 min-w-0">
                  <span className="text-[11px] font-bold text-indigo-500 mt-0.5 shrink-0">
                    {index + 1}.
                  </span>
                  <p className="text-xs text-gray-800 group-hover:text-indigo-900 leading-snug">
                    {item}
                  </p>
                </div>
                <SendIcon
                  sx={{ fontSize: 14 }}
                  className="text-gray-300 group-hover:text-indigo-600 shrink-0 mt-0.5 transition-colors"
                />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-gray-400">
            <span>Powered by Google Gemini</span>
            <button
              type="button"
              onClick={() => handleToggleConsent(false)}
              className="hover:text-red-500 underline"
            >
              Revoke Consent
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiReplySuggestions;
