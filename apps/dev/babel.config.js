module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'nativewind/babel',
    ],
    plugins: [
      [
        'babel-plugin-module-resolver',
        {
          root: ['../../packages/design-system/src'],
          alias: {
            'src': '../../packages/design-system/src',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};

