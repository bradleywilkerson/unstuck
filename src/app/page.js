'use client';

import { useState } from 'react';
import TaskInput from './components/TaskInput';
import Response from './components/Response';
import { config } from './config';

export default function Home() {
  const [entries, setEntries] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (taskEntries) => {
    setIsLoading(true);
    try {
      // First try a preflight request
      const preflightResponse = await fetch(`${config.apiUrl}/gpt`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
        },
      });

      // Proceed with the actual request
      const response = await fetch(`${config.apiUrl}/gpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ taskEntries }),
      });

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries([...response.headers]));
        throw new Error(`Failed to process tasks: ${response.status}`);
      }
      
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error details:', error);
      // Fallback to simple format if API fails
      const fallbackEntries = taskEntries.map(task => ({
        title: task,
        body: `You need to complete: ${task}`,
        taskName: task
      }));
      setEntries(fallbackEntries);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setEntries(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {entries === null ? (
          <TaskInput onContinue={handleContinue} isLoading={isLoading} />
        ) : (
          <Response entries={entries} onStartOver={handleStartOver} />
        )}
      </div>
    </main>
  );
}
