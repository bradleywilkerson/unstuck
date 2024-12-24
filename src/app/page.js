'use client';

import { useState } from 'react';
import TaskInput from './components/TaskInput';
import Response from './components/Response';

export default function Home() {
  const [entries, setEntries] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (taskEntries) => {
    setIsLoading(true);
    try {
      const response = await fetch(process.env.NODE_ENV === 'development' ? 'http://localhost:8000/gpt' : 'https://unstuck-two.vercel.app/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ taskEntries }),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error('Failed to process tasks');
      }
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error:', error);
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
