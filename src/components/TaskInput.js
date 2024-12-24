import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';

export default function TaskInput({ onContinue, isLoading }) {
  const [entries, setEntries] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [prompt, setPrompt] = useState("What are you procrastinating right now?");
  const [hint, setHint] = useState("type your task and tap add");
  const [fadeAnim] = useState(new Animated.Value(0));

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(callback);
  };

  const updateTextWithAnimation = async (newPrompt, newHint) => {
    fadeOut(() => {
      setPrompt(newPrompt);
      setHint(newHint);
      fadeIn();
    });
  };

  const handleAdd = async () => {
    if (isLoading) return;
    
    const value = currentInput.trim();
    if (!value) return;
    
    const newEntries = [...entries, value];
    setEntries(newEntries);
    setCurrentInput('');
    Keyboard.dismiss();
    
    if (newEntries.length < 2) {
      updateTextWithAnimation(
        "Anything else you're struggling to get done?",
        "add another task or tap continue"
      );
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

  useEffect(() => {
    fadeIn();
  }, []);

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Animated.Text style={{
        fontSize: 24,
        fontWeight: '300',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20,
        opacity: fadeAnim,
      }}>
        {prompt}
      </Animated.Text>

      <View style={{ width: '100%', position: 'relative' }}>
        <TextInput
          value={currentInput}
          onChangeText={setCurrentInput}
          onSubmitEditing={handleAdd}
          placeholder="add task here"
          placeholderTextColor="#333"
          autoFocus
          editable={!isLoading}
          style={{
            width: '100%',
            fontSize: 20,
            color: 'white',
            textAlign: 'center',
            paddingVertical: 10,
            paddingHorizontal: 50,
          }}
        />
        <TouchableOpacity
          onPress={handleAdd}
          disabled={!currentInput.trim() || isLoading}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: [{ translateY: -18 }],
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            opacity: !currentInput.trim() || isLoading ? 0.5 : 1,
          }}
        >
          <Text style={{ color: 'white', fontSize: 14 }}>Add</Text>
        </TouchableOpacity>
      </View>

      <Animated.Text style={{
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        opacity: fadeAnim,
      }}>
        {hint}
      </Animated.Text>

      {entries.length > 0 && (
        <ScrollView style={{ width: '100%', maxHeight: 300, marginTop: 20 }}>
          <Text style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Your tasks:</Text>
          {entries.map((entry, index) => (
            <Animated.Text
              key={index}
              style={{
                color: '#ccc',
                marginBottom: 8,
                opacity: fadeAnim,
              }}
            >
              {index + 1}. {entry}
            </Animated.Text>
          ))}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              paddingHorizontal: 24,
              paddingVertical: 8,
              borderRadius: 8,
              alignSelf: 'center',
              marginTop: 16,
              opacity: isLoading ? 0.5 : 1,
              minWidth: 100,
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white' }}>Continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
} 