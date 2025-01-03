'use client';

import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import useIsMobile from '../hooks/useIsMobile';

export default function TaskInput({ onContinue, isLoading }) {
  const [entries, setEntries] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [prompt, setPrompt] = useState("What are you procrastinating right now?");
  const isMobile = useIsMobile();
  const textareaRef = useRef(null);
  const [hint, setHint] = useState(
    isMobile ? "type your task and tap add" : "press enter to add, cmd + enter to continue"
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [currentInput]);

  useEffect(() => {
    console.log("is mobile", isMobile)
    const newHint = isMobile 
      ? "add another task or tap continue" 
      : "press enter to add more, cmd + enter to continue";
    setHint(newHint);
  }, [isMobile])

  const updateTextWithAnimation = async (elementId, newText) => {
    setIsAnimating(true);
    const element = document.getElementById(elementId);
    element.classList.remove('show');
    
    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update text and fade in
    element.innerText = newText;
    element.classList.add('show');
    
    setIsAnimating(false);
  };

  const handleAdd = async () => {
    if (isAnimating || isLoading) return;
    
    const value = currentInput.trim();
    if (!value) return;
    
    const newEntries = [...entries, value];
    setEntries(newEntries);
    setCurrentInput('');
    
    if (newEntries.length < 2) {
      console.log(isMobile, 'from input')
      const newHint = isMobile 
        ? "add another task or tap continue" 
        : "press enter to add more, cmd + enter to continue";
      await Promise.all([
        updateTextWithAnimation('prompt', "Anything else you're struggling to get done?"),
        updateTextWithAnimation('hint', newHint)
      ]);
    } 
    if (newEntries.length > 9) {
      onContinue(newEntries);
    }
  };

  const handleContinue = () => {
    if (entries.length > 0 && !isLoading) {
      onContinue(entries);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey) {
        // Cmd/Ctrl + Enter to continue
        handleContinue();
      } else {
        // Enter to add task
        handleAdd();
      }
    }
  };

  useEffect(() => {
    // Add show class after initial mount
    const elements = document.querySelectorAll('.fade-transition');
    setTimeout(() => {
      elements.forEach(el => el.classList.add('show'));
    }, 100);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <h1 className="text-3xl font-light text-center fade-transition" id="prompt">
        {prompt}
      </h1>
      <div className="flex flex-col items-center gap-2 w-full">
        <textarea 
          ref={textareaRef}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="add task here"
          disabled={isLoading}
          rows={1}
          className="w-full text-xl bg-transparent border-none outline-none text-center placeholder:text-gray-800 focus:placeholder-transparent disabled:opacity-50 resize-none overflow-hidden"
          style={{ minHeight: '44px'}}
        />
        <button
          onClick={handleAdd}
          disabled={!currentInput.trim() || isAnimating || isLoading}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors text-sm"
        >
          Add
        </button>
      </div>
      <div className="flex flex-col items-center gap-4 w-full">
        <span className="text-sm text-gray-400 fade-transition" id="hint">
          {hint}
        </span>
        {entries.length > 0 && (
          <>
            <div className="w-full max-w-md">
              <div className="text-sm text-gray-400 mb-2">Your tasks:</div>
              <div className="flex flex-col gap-2">
                {entries.map((entry, index) => (
                  <div key={index} className="text-gray-300 animate-fade-in break-words whitespace-pre-wrap">
                    {index + 1}. {entry}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="relative px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors mt-4 min-w-[100px]"
            >
              {isLoading ? <LoadingSpinner /> : 'Continue'}
            </button>
          </>
        )}
      </div>
    </div>
  );
} 