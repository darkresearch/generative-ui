import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

export function useFonts() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Check if fonts are already loaded
      if (document.getElementById('satoshi-fonts')) return;
      
      const loadFonts = async () => {
        try {
          // Load fonts using expo-asset
          const assets = await Asset.loadAsync([
            require('../assets/fonts/Satoshi-Regular.woff2'),
            require('../assets/fonts/Satoshi-Medium.woff2'),
            require('../assets/fonts/Satoshi-Bold.woff2'),
          ]);
          
          const [regularAsset, mediumAsset, boldAsset] = assets;
          
          // Check if assets loaded properly
          if (!regularAsset || !mediumAsset || !boldAsset) {
            console.warn('Some fonts failed to load');
            return;
          }
          
          const style = document.createElement('style');
          style.id = 'satoshi-fonts';
          style.textContent = `
            @font-face {
              font-family: 'Satoshi';
              src: url('${regularAsset.localUri || regularAsset.uri}') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Satoshi';
              src: url('${mediumAsset.localUri || mediumAsset.uri}') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Satoshi';
              src: url('${boldAsset.localUri || boldAsset.uri}') format('woff2');
              font-weight: 600;
              font-style: normal;
              font-display: swap;
            }
          `;
          document.head.appendChild(style);
        } catch (error) {
          console.warn('Failed to load Satoshi fonts:', error);
        }
      };
      
      loadFonts();
    }
  }, []);
}

