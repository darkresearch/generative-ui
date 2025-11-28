// Load Geist fonts from Google Fonts
import {
  useFonts as useGeistFonts,
  Geist_400Regular,
  Geist_500Medium,
  Geist_700Bold,
} from '@expo-google-fonts/geist';

export function useAppFonts() {
  const [fontsLoaded] = useGeistFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_700Bold,
  });

  return [fontsLoaded];
}

