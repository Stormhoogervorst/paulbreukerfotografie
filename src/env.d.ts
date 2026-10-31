// Astro declareert alleen `*.jpg`. Deze bronbestanden heten `*.JPG` op schijf.
declare module '*.JPG' {
  const metadata: import('astro').ImageMetadata;
  export default metadata;
}
