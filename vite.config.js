import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['7ac7-77-28-18-193.ngrok-free.app'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', 'three/addons/controls/OrbitControls.js', 'three/addons/environments/RoomEnvironment.js', 'three/addons/geometries/RoundedBoxGeometry.js', 'three/addons/postprocessing/EffectComposer.js', 'three/addons/postprocessing/RenderPass.js', 'three/addons/postprocessing/GTAOPass.js', 'three/addons/postprocessing/OutputPass.js'],
          physics: ['cannon-es'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
