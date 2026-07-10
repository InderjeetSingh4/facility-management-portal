import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.facilityportal.app',
  appName: 'Facility Portal',
  webDir: 'public',
  server: {
    url: 'https://facility-management-portal-theta.vercel.app',
    cleartext: false
  }
};

export default config;
