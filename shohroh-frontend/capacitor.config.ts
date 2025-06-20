import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.shohroh.app',
  appName: 'Shohroh',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    // Allow connections to our backend server
    allowNavigation: ['localhost:4000']
  }
};

export default config; 