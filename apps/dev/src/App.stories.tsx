import React from 'react';
import App from './App';

export default {
  title: 'App/MinimalApp',
  component: App,
};

// Main app view
export const Default = () => <App />;

// Story notes:
// - Shows FAB with squircle shape
// - Demonstrates Dark color system (#EEEDED bg, #262626 text)
// - Counter interaction works
// - Safe area handling for notch
export const WithDescription = {
  render: () => <App />,
  parameters: {
    docs: {
      description: {
        story: 'Minimal app template showcasing @darkresearch/design-system with FAB, squircles, and Dark branding.',
      },
    },
  },
};

