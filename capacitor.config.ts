import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.facilityportal.app',
  appName: 'FacilityOS',
  webDir: 'public',
  server: {
    url: 'https://facility-management-portal-theta.vercel.app',
    cleartext: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
