import React from 'react';
import SplashScreen from './splash';

export default function IndexScreen() {
  // Always show splash then onboarding on every app open/restart
  return <SplashScreen />;
}