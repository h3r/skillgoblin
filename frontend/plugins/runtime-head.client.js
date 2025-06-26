export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public;
  console.log('🧠 runtime-head.client plugin initializing with config:', config);

  useHead({
    title: config.appName,
    meta: [
      { name: 'description', content: config.appDescription },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'msapplication-TileColor', content: config.backgroundColor },
      { name: 'theme-color', content: config.themeColor },
      { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { 'http-equiv': 'Pragma', content: 'no-cache' },
      { 'http-equiv': 'Expires', content: '0' }
    ]
  });
});