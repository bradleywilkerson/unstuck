import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import TaskInput from './src/components/TaskInput';
import Response from './src/components/Response';

export default function App() {
  const [entries, setEntries] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (taskEntries) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://unstuck-4mh2.onrender.com/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ taskEntries }),
      });

      if (!response.ok) {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle="light-content" />
      <View style={{ 
        flex: 1, 
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {entries === null ? (
          <TaskInput onContinue={handleContinue} isLoading={isLoading} />
        ) : (
          <Response entries={entries} onStartOver={handleStartOver} />
        )}
      </View>
    </SafeAreaView>
  );
} 