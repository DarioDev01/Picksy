import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (incluyendo las de .env)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Limpiamos la key por si tiene espacios o saltos de línea invisibles
  const apiKey = (env.VITE_ANTHROPIC_API_KEY || '').trim();

  if (apiKey) {
    console.log(`[Picksy] API Key loaded successfully (Length: ${apiKey.length})`);
  } else {
    console.warn('[Picksy] WARNING: VITE_ANTHROPIC_API_KEY not found in .env');
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/chat': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/chat/, '/v1/messages'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Inyectar headers manualmente para máxima precisión
              proxyReq.setHeader('x-api-key', apiKey);
              proxyReq.setHeader('anthropic-version', '2023-06-01');
              proxyReq.setHeader('content-type', 'application/json');
              
              // Eliminar cabeceras del navegador para evitar la restricción CORS estricta 
              // de Anthropic donde exige 'anthropic-dangerous-direct-browser-access'
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
            proxy.on('error', (err) => {
              console.error('[Picksy Proxy Error]', err.message);
            });
          }
        }
      }
    }
  }
})
