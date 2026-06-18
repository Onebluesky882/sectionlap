// Allow side-effect import of global.css processed by NativeWind/metro
declare module "*.css" {
  const content: undefined;
  export default content;
}
