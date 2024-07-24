module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        "react-native-reanimated/plugin",
        {
          processNestedWorklets: true
        },
      ],
      // ['react-native-worklets-core/plugin'],
      [
        'module-resolver',
        {
          alias: {
            [pak.name]: path.join(__dirname, '..', pak.source),
          },
        },
      ],
    ],
  };
};
