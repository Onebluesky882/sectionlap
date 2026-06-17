module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // worklets:false prevents babel-preset-expo from loading react-native-worklets/plugin
      // which is only needed for Reanimated 4+. We use Reanimated 3.x.
      // jsxImportSource:"nativewind" replaces the standalone "nativewind/babel" preset
      // (which transitively requires react-native-worklets/plugin via css-interop).
      ["babel-preset-expo", { jsxImportSource: "nativewind", worklets: false }],
    ],
  };
};
