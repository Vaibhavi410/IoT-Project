
import { Redirect } from 'expo-router';
import React from 'react';

export default function Entry() {
  // TEMP: bypass AsyncStorage gating so we can test
  // Splash -> Onboarding -> Sign In flows reliably.
  return <Redirect href="/splash" />;
}

