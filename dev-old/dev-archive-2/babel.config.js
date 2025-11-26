module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
      ['react-native-unistyles/plugin', {
        root: 'src',
        autoProcessImports: ['@darkresearch/design-system'],
      }],
      'react-native-worklets/plugin',
    ],
  };
};
