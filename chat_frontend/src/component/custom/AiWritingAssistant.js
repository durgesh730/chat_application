import React, { useState } from 'react';
import fetcher from '../../helper/fetcher';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ShortTextIcon from '@mui/icons-material/ShortText';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

const WRITING_OPTIONS = [
  {
    id: 'grammar',
    label: 'Correct Grammar',
    description: 'Fix typos, spelling & sentence structure',
    icon: <SpellcheckIcon sx={{ fontSize: 18 }} />,
    color: 'text-emerald-600 bg-emerald-50',
    type: 'correct',
  },
  {
    id: 'improve',
    label: 'Improve English',
    description: 'Enhance vocabulary, flow & clarity',
    icon: <LanguageIcon sx={{ fontSize: 18 }} />,
    color: 'text-indigo-600 bg-indigo-50',
    type: 'rewrite',
    style: 'improve',
  },
  {
    id: 'professional',
    label: 'Make Professional',
    description: 'Courteous, polite, workplace-ready',
    icon: <BusinessCenterOutlinedIcon sx={{ fontSize: 18 }} />,
    color: 'text-blue-600 bg-blue-50',
    type: 'rewrite',
    style: 'professional',
  },
  {
    id: 'friendly',
    label: 'Make Friendly',
    description: 'Warm, upbeat, approachable tone',
    icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 18 }} />,
    color: 'text-amber-600 bg-amber-50',
    type: 'rewrite',
    style: 'friendly',
  },
  {
    id: 'shorten',
    label: 'Shorten Message',
    description: 'Concise, direct, remove fluff',
    icon: <ShortTextIcon sx={{ fontSize: 18 }} />,
    color: 'text-violet-600 bg-violet-50',
    type: 'rewrite',
    style: 'shorten',
  },
];

const AiWritingAssistant = ({ currentMessage, onApply, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSelectOption = async (option) => {
    const textToProcess = currentMessage?.trim();
    if (!textToProcess) {
      setError('Please type a message in the input box first.');
      return;
    }

    setSelectedOption(option);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      if (option.type === 'correct') {
        res = await fetcher.post('/ai/correct', { message: textToProcess });
        if (res.data?.success) {
          setResult(res.data.corrected);
        }
      } else {
        res = await fetcher.post('/ai/rewrite', {
          message: textToProcess,
          style: option.style,
        });
        if (res.data?.success) {
          setResult(res.data.rewritten);
        }
      }
    } catch (err) {
      console.error('[AI Assistant Error]:', err);
      const errMsg =
        err.response?.data?.message ||
        'Could not generate suggestion. Please check your connection or API key.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseMessage = () => {
    if (result) {
      onApply(result);
      onClose();
    }
  };

  const handleDiscard = () => {
    setResult(null);
    setSelectedOption(null);
    setError(null);
  };

  return (
    <div className="absolute bottom-16 right-2 sm:right-16 z-40 w-80 sm:w-96 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-100 p-3.5 animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-2.5">
        <div className="flex items-center space-x-1.5">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
            <AutoAwesomeIcon sx={{ fontSize: 14 }} />
          </span>
          <span className="text-xs font-bold text-gray-800 tracking-tight">
            AI Writing Assistant
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Close AI Assistant"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-2.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start justify-between">
          <span className="leading-snug">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading View */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <CircularProgress size={28} sx={{ color: '#6366f1' }} />
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-800">
              Generating with Gemini...
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Refining: "{selectedOption?.label}"
            </p>
          </div>
        </div>
      )}

      {/* Result Preview View */}
      {!loading && result && (
        <div className="space-y-2.5">
          {/* Style indicator */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {selectedOption?.label}
            </span>
            <span className="text-gray-400">Gemini Suggestion</span>
          </div>

          {/* Original message */}
          <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Original
            </span>
            <p className="text-xs text-gray-600 line-clamp-3 select-text">
              {currentMessage}
            </p>
          </div>

          {/* Suggested message */}
          <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              ✨ Suggested
            </span>
            <p className="text-xs font-medium text-gray-900 select-text leading-relaxed">
              {result}
            </p>
          </div>

          {/* Action buttons: Use This Message vs Discard */}
          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={handleUseMessage}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center space-x-1"
            >
              <CheckIcon sx={{ fontSize: 15 }} />
              <span>Use This Message</span>
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Options Menu View */}
      {!loading && !result && (
        <div className="space-y-1">
          <p className="text-[11px] text-gray-400 mb-1 px-1">
            Choose how you would like Gemini to rewrite your draft:
          </p>
          {WRITING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt)}
              className="w-full p-2 rounded-xl flex items-center space-x-2.5 hover:bg-indigo-50/70 transition-colors text-left group"
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${opt.color} shrink-0 group-hover:scale-105 transition-transform`}
              >
                {opt.icon}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-gray-800 block group-hover:text-indigo-600 transition-colors">
                  {opt.label}
                </span>
                <span className="text-[11px] text-gray-400 block truncate">
                  {opt.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiWritingAssistant;
