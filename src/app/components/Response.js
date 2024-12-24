'use client';

import { useState, useEffect } from 'react';
import useIsMobile from '../hooks/useIsMobile';

export default function Response({ entries, onStartOver }) {
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState('quote');
  const [currentActionStep, setCurrentActionStep] = useState(0);
  const isMobile = useIsMobile();

  const entry = entries[currentEntryIndex];
  const totalSteps = entries.length * (2 + (entry?.action?.length || 0));
  
  const calculateProgress = () => {
    const stepsPerEntry = 2 + (entry?.action?.length || 0); // quote + motivation + action steps
    const completedEntries = currentEntryIndex * stepsPerEntry;
    let currentEntryProgress = 0;
    
    if (currentStep === 'motivation') currentEntryProgress = 1;
    else if (currentStep === 'action') currentEntryProgress = 2 + currentActionStep;
    else if (currentStep === 'complete') return 100;
    
    return Math.round(((completedEntries + currentEntryProgress) / totalSteps) * 100);
  };

  // Calculate task marker positions
  const getTaskMarkers = () => {
    const markers = [];
    let totalStepsAccumulated = 0;
    
    entries.forEach((entry, index) => {
      if (index === 0) return; // Skip first marker
      const stepsForEntry = 2 + (entry.action?.length || 0);
      totalStepsAccumulated += stepsForEntry;
      const percentage = (totalStepsAccumulated / totalSteps) * 100;
      markers.push(percentage);
    });

    return markers;
  };

  const handleNext = () => {
    if (currentStep === 'complete') return;
    
    if (currentStep === 'quote') {
      setCurrentStep('motivation');
    } else if (currentStep === 'motivation') {
      setCurrentStep('action');
    } else if (currentStep === 'action') {
      if (currentActionStep < entry.action.length - 1) {
        setCurrentActionStep(prev => prev + 1);
      } else if (currentEntryIndex < entries.length - 1) {
        setCurrentEntryIndex(prev => prev + 1);
        setCurrentStep('quote');
        setCurrentActionStep(0);
      } else {
        setCurrentStep('complete');
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'motivation') {
      setCurrentStep('quote');
    } else if (currentStep === 'action') {
      if (currentActionStep > 0) {
        setCurrentActionStep(prev => prev - 1);
      } else {
        setCurrentStep('motivation');
      }
    } else if (currentStep === 'quote' && currentEntryIndex > 0) {
      setCurrentEntryIndex(prev => prev - 1);
      const prevEntry = entries[currentEntryIndex - 1];
      setCurrentStep('action');
      setCurrentActionStep(prevEntry.action.length - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isMobile && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        if (currentStep !== 'complete') {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, currentEntryIndex, currentActionStep, isMobile]);

  useEffect(() => {
    // Add show class after initial mount
    const elements = document.querySelectorAll('.response-fade');
    setTimeout(() => {
      elements.forEach(el => el.classList.add('show'));
    }, 100);
  }, [currentStep, currentActionStep, currentEntryIndex]);

  if (currentStep === 'complete') {
    return (
      <div className="flex flex-col items-center gap-8 w-full animate-fade-in">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: '100%' }}
          />
        </div>
        <div className="fade-transition response-fade text-center">
          <h1 className="text-4xl font-light mb-6">🎉 You did it!</h1>
          <p className="text-xl text-gray-300 mb-8">
            If you followed the steps, you should be done with your task{entries.length === 1 ? '' : 's'}, and you should be proud of yourself.
          </p>
          <button
            onClick={onStartOver}
            className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full animate-fade-in">
      <div className="w-full">
        <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${calculateProgress()}%` }}
          />
          {getTaskMarkers().map((position, index) => (
            <div
              key={index}
              className="absolute top-0 w-px h-full bg-white/30"
              style={{ left: `${position}%` }}
            />
          ))}
        </div>
        <div className="text-center text-sm text-gray-400 mb-8">
          Task {currentEntryIndex + 1} of {entries.length}: <span className="text-white">{entries[currentEntryIndex].taskName}</span>
        </div>
      </div>
      
      <div className="relative flex flex-col items-center gap-8 w-full max-w-2xl min-h-[400px] justify-center">
        {/* Touch areas for mobile */}
        {isMobile && currentStep !== 'complete' && (
          <>
            <div 
              className="absolute left-0 top-0 w-[30%] h-full cursor-pointer z-10" 
              onClick={handleBack}
              aria-label="Previous"
            />
            <div 
              className="absolute right-0 top-0 w-[30%] h-full cursor-pointer z-10" 
              onClick={handleNext}
              aria-label="Next"
            />
          </>
        )}
        
        {currentStep === 'quote' && (
          <div className="fade-transition response-fade text-center">
            <blockquote className="text-3xl italic mb-4">
              &ldquo;{entry.quote.text}&rdquo;
            </blockquote>
            <footer className="text-xl text-gray-400">— {entry.quote.author}</footer>
          </div>
        )}
        
        {currentStep === 'motivation' && (
          <div className="fade-transition response-fade text-center">
            <p className="text-2xl text-gray-200">{entry.motivation}</p>
          </div>
        )}
        
        {currentStep === 'action' && (
          <div className="fade-transition response-fade text-center">
            <h3 className="text-3xl font-light mb-6">{currentActionStep + 1}</h3>
            <p className="text-2xl text-gray-200">{entry.action[currentActionStep]}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={handleBack}
          disabled={currentStep === 'quote' && currentEntryIndex === 0}
          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          Continue {!isMobile && <span className="text-xs text-gray-400 ml-2">(⌘ + ↵)</span>}
        </button>
      </div>
    </div>
  );
} 