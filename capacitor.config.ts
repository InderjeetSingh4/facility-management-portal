import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inderjeet.facility',
  appName: 'Facility Portal',
  webDir: 'public',
  server: {
    url: 'https://facility-management-portal-theta.vercel.app',
    cleartext: true
  }
};

export default config;
