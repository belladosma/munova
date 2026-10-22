# MUNOVA — micrófono en Windows

## En Vercel (recomendado)

1. Publica el proyecto y abre la URL HTTPS de MUNOVA en la versión actual de Google Chrome o Microsoft Edge.
2. Entra en **Mesa en vivo** y pulsa el botón 🎙. Por seguridad, los navegadores no permiten que una página pida acceso al micrófono sin una acción del usuario; este primer clic dispara la solicitud.
3. En el aviso del navegador elige **Permitir**.
4. Si no aparece el aviso o antes elegiste bloquear: pulsa el icono de ajustes/candado junto a la URL → **Permisos del sitio** → **Micrófono** → **Permitir**; recarga la página.
5. Si Windows sigue bloqueándolo, abre **Configuración → Privacidad y seguridad → Micrófono** y activa el acceso al micrófono y el permiso para aplicaciones de escritorio.
6. Vuelve a Mesa en vivo y pulsa 🎙. El estado de MUNOVA indica si el dictado está activo, detenido o bloqueado.

## Probar en Windows antes de desplegar

- Descomprime el ZIP completo.
- Ejecuta `Start-MUNOVA.bat`. Se inicia un servidor local de Python y abre `http://127.0.0.1:8765`.
- Mantén la ventana del servidor abierta mientras utilizas la aplicación.
- No abras `index.html` con doble clic para probar el micrófono: `file://` no es un origen adecuado para este permiso.

## Límites reales

- El dictado usa `SpeechRecognition` / `webkitSpeechRecognition`, disponible principalmente en Chrome y Edge de escritorio. El reconocimiento puede requerir internet y su disponibilidad depende del navegador, región y políticas del dispositivo.
- La aplicación solicita el permiso al pulsar el micrófono, no al cargar la página. Esa interacción es obligatoria por diseño de seguridad del navegador.
- Revisa nombres propios, cifras y términos jurídicos en la transcripción antes de guardar o citar.

## Banderas

MUNOVA convierte los emojis de bandera en imágenes PNG de `flagcdn.com` cuando hay conexión. Si el recurso externo no está disponible, vuelve a mostrar el emoji original. En los selectores de país, la bandera seleccionada aparece como icono del campo; la lista desplegable nativa puede mostrar el emoji según las fuentes instaladas en Windows.
