// Load Satoshi OTF fonts for all platforms (web and native)
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-Italic': require('../assets/fonts/Satoshi-Italic.otf'),
  });
}

