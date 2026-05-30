// Tells TypeScript that importing a .css file is valid (side-effect import)
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
