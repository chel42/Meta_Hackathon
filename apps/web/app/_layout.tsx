import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { TraunesAIDataProvider } from '../src/context/TraunesAIDataContext';
import { AcademyProvider } from '../src/context/AcademyContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = "TRAUNES AI - Plateforme de vérification de l'information";
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <TraunesAIDataProvider>
            <AcademyProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#F5F8FA' },
                }}
              />
            </AcademyProvider>
          </TraunesAIDataProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
