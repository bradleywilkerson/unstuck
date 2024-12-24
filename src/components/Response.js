import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Response({ entries, onStartOver }) {
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState('quote');
  const [currentActionStep, setCurrentActionStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));

  const entry = entries[currentEntryIndex];
  const totalSteps = entries.length * (2 + (entry?.action?.length || 0));

  const calculateProgress = () => {
    const stepsPerEntry = 2 + (entry?.action?.length || 0);
    const completedEntries = currentEntryIndex * stepsPerEntry;
    let currentEntryProgress = 0;
    
    if (currentStep === 'motivation') currentEntryProgress = 1;
    else if (currentStep === 'action') currentEntryProgress = 2 + currentActionStep;
    else if (currentStep === 'complete') return 100;
    
    return Math.round(((completedEntries + currentEntryProgress) / totalSteps) * 100);
  };

  const animateProgress = (progress) => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
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
    fadeIn();
    animateProgress(calculateProgress());
  }, [currentStep, currentActionStep, currentEntryIndex]);

  if (currentStep === 'complete') {
    return (
      <View style={{ width: '100%', alignItems: 'center' }}>
        <View style={{ width: '100%', height: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 24 }}>
          <Animated.View 
            style={{ 
              height: '100%', 
              backgroundColor: 'white',
              width: '100%',
            }} 
          />
        </View>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '300', color: 'white', marginBottom: 24 }}>
            🎉 You did it!
          </Text>
          <Text style={{ fontSize: 18, color: '#ccc', textAlign: 'center', marginBottom: 32 }}>
            If you followed the steps, you should be done with your task{entries.length === 1 ? '' : 's'}, and you should be proud of yourself.
          </Text>
          <TouchableOpacity
            onPress={onStartOver}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              paddingHorizontal: 24,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white' }}>Start Over</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ width: '100%' }}>
        <View style={{ width: '100%', height: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 24 }}>
          <Animated.View 
            style={{ 
              height: '100%', 
              backgroundColor: 'white',
              width: progressWidth,
            }} 
          />
        </View>
        <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 32 }}>
          Task {currentEntryIndex + 1} of {entries.length}:{' '}
          <Text style={{ color: 'white' }}>{entries[currentEntryIndex].taskName}</Text>
        </Text>
      </View>

      <TouchableWithoutFeedback onPress={handleNext}>
        <View style={{ width: '100%', minHeight: 400, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            {currentStep === 'quote' && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontStyle: 'italic', color: 'white', textAlign: 'center', marginBottom: 16 }}>
                  "{entry.quote.text}"
                </Text>
                <Text style={{ fontSize: 18, color: '#999' }}>— {entry.quote.author}</Text>
              </View>
            )}
            
            {currentStep === 'motivation' && (
              <Text style={{ fontSize: 20, color: '#ccc', textAlign: 'center' }}>
                {entry.motivation}
              </Text>
            )}
            
            {currentStep === 'action' && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '300', color: 'white', marginBottom: 24 }}>
                  {currentActionStep + 1}
                </Text>
                <Text style={{ fontSize: 20, color: '#ccc', textAlign: 'center' }}>
                  {entry.action[currentActionStep]}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={currentStep === 'quote' && currentEntryIndex === 0}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            paddingHorizontal: 24,
            paddingVertical: 8,
            borderRadius: 8,
            opacity: currentStep === 'quote' && currentEntryIndex === 0 ? 0.5 : 1,
          }}
        >
          <Text style={{ color: 'white' }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            paddingHorizontal: 24,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white' }}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 