const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// config.transformer = {
//   babelTransformerPath: require.resolve("react-native-svg-transformer"),
// };

// config.resolver = {
//   assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
//   sourceExts: [...config.resolver.sourceExts, "svg"],
// };

// const { transformer, resolver } = config;

// config.transformer = {
//   ...transformer,
//   babelTransformerPath: require.resolve("react-native-svg-transformer"),
// };

// config.resolver = {
//   ...resolver,
//   assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
//   sourceExts: [...resolver.sourceExts, "svg"],
// };

module.exports = config;
