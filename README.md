# MUNOVA Ultimate

Aplicación web para Model United Nations: comité, delegaciones, mesa en vivo, handbook, investigación, laboratorio resolutivo, estrategia, oratoria y documentos.

## Seguridad de Gemini

La clave API debe guardarse exclusivamente como variable privada `GEMINI_API_KEY` en Vercel. El navegador llama a `/api/mun-ai`; la función de servidor llama a Gemini y nunca devuelve la clave al cliente. No pegues la clave real en GitHub, en el HTML o en este chat. Revisa `CONFIGURAR-IA.md`.

## Desarrollo local

- Windows: ejecuta `Start-MUNOVA.bat`.
- macOS: ejecuta `Start-MUNOVA.command`.
- Para probar el endpoint local, usa Vercel CLI (`vercel dev`) y variables locales en `.env.local`; nunca subas `.env.local` a GitHub.

## Despliegue

Sigue `DEPLOY-VERCEL.md`. Estructura principal: `index.html` en la raíz y función `api/mun-ai.js` dentro de `api/`. El archivo `vercel.json` no declara patrones de funciones.

## Límite importante

`npm run check` valida la estructura y sintaxis; no puede garantizar el estado de los servicios externos ni validar credenciales reales. La conexión final se debe probar en la URL de Vercel.
