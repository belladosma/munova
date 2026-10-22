# Publicar MUNOVA en Vercel desde GitHub

## Estructura requerida en la raíz del repositorio

```text
index.html
vercel.json
package.json
manifest.webmanifest
service-worker.js
api/mun-ai.js
icon-192.png
icon-512.png
```

La carpeta `api` debe estar directamente en la raíz, no dentro de otra carpeta. `vercel.json` no debe declarar un patrón `functions` para `api/mun-ai.js`.

## Pasos

1. Sube el contenido de esta carpeta al repositorio de GitHub; no subas el ZIP como un único archivo.
2. En Vercel importa ese repositorio.
3. En **Project Settings → General**, deja **Root Directory** en la raíz del repositorio.
4. Para esta estructura estática, no configures un directorio de salida `dist` ni un comando de compilación personalizado. Vercel debe detectar el archivo de función `api/mun-ai.js`.
5. Configura las variables privadas según `CONFIGURAR-IA.md`.
6. Haz Deploy/Redeploy.
7. Abre la URL HTTPS, entra a Ajustes y pulsa **Probar conexión con Gemini**.

## Comprobación local de archivos

Con Node.js instalado, abre una terminal en la carpeta y ejecuta:

```bash
npm run check
```

Esto revisa archivos requeridos y sintaxis. No puede verificar tus variables de Vercel ni reemplaza una prueba real después del despliegue.
