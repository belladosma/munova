# Configurar Gemini de forma privada en MUNOVA

**No incluyas tu clave real en GitHub, en `index.html`, en `api/mun-ai.js`, ni en este archivo.** El endpoint de servidor lee la clave desde `process.env.GEMINI_API_KEY` y la envía a Google mediante el encabezado `x-goog-api-key`. La clave no se devuelve al navegador ni se escribe en la URL.

## 1. Crear variables privadas en Vercel

En Vercel abre tu proyecto → **Settings → Environment Variables**. Crea estas variables para **Production** (y Preview si quieres probar despliegues de prueba):

- `GEMINI_API_KEY`: pega aquí tu clave de Google AI Studio. No la pegues en GitHub ni en este chat.
- `MUNOVA_ACCESS_CODE`: crea un código largo, único y aleatorio. Lo escribirás en Ajustes de MUNOVA para autorizar las solicitudes a la IA.
- `GEMINI_MODEL`: `gemini-3.8-flash`.
- `MUNOVA_WEB_SEARCH`: `false` para empezar y evitar activar búsqueda web que pueda tener condiciones/cargos diferentes.

Guarda y haz **Redeploy** para que las variables lleguen al servidor.

## 2. Probar la conexión

Abre la URL HTTPS de MUNOVA → **Ajustes** → introduce el mismo valor de `MUNOVA_ACCESS_CODE` → **Probar conexión con Gemini**. No introduzcas la clave API en la aplicación; la aplicación nunca necesita recibirla.

## 3. Mantener la clave protegida

- El archivo `.env.example` contiene solo un marcador de posición; no lo reemplaces por tu clave real.
- El `.gitignore` excluye `.env` y `.env.local`.
- Si alguna vez subes una clave real a GitHub, aunque luego borres el archivo, revócala en Google AI Studio y crea otra.
- El endpoint valida el código de acceso, limita el tamaño de las solicitudes y aplica un límite de ráfaga por instancia. Este último es una defensa básica, no un sistema global de cuotas/autenticación multiusuario.
- Para un sitio público con varios usuarios, añade autenticación real y un limitador compartido (por ejemplo, Redis/Upstash o una base de datos). No compartas `MUNOVA_ACCESS_CODE` con visitantes.

## 4. Búsqueda web

`MUNOVA_WEB_SEARCH=false` mantiene desactivada la herramienta de Google Search. La IA puede analizar el contexto, los documentos y los enlaces que tú proporciones, pero no debe afirmar que verificó información actual en internet. Antes de activar búsqueda, revisa las condiciones y precios vigentes de Google AI Studio/Gemini API.

Modelo por defecto: `gemini-3.8-flash`. La disponibilidad y cuota gratuita dependen del proyecto, región, cuenta y condiciones actuales de Google.
