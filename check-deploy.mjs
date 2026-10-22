import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const required = ['index.html', 'api/mun-ai.js', 'vercel.json', 'package.json', 'manifest.webmanifest', 'service-worker.js', '.gitignore', 'CONFIGURAR-IA.md'];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('FALTAN ARCHIVOS EN LA RAÍZ DEL PROYECTO:', missing.join(', '));
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
if (config.functions) {
  console.error('vercel.json aún contiene functions; elimina ese bloque para evitar patrones sin coincidencia.');
  process.exit(1);
}
const api = fs.readFileSync(path.join(root, 'api/mun-ai.js'), 'utf8');
for (const token of ["process.env.GEMINI_API_KEY", "process.env.MUNOVA_ACCESS_CODE", "'x-goog-api-key': key", 'systemInstruction']) {
  if (!api.includes(token)) {
    console.error(`Falta la configuración de seguridad/API esperada: ${token}`);
    process.exit(1);
  }
}
if (/AIza[0-9A-Za-z_-]{20,}/.test(api)) {
  console.error('Posible clave de Google incrustada en api/mun-ai.js. Retírala y rótala si es real.');
  process.exit(1);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/AIza[0-9A-Za-z_-]{20,}/.test(html)) {
  console.error('Posible clave de Google incrustada en index.html. Retírala y rótala si es real.');
  process.exit(1);
}
const jsFiles = ['api/mun-ai.js', 'firebase-cloud.js', 'service-worker.js'];
for (const file of jsFiles) {
  if (!fs.existsSync(path.join(root, file))) continue;
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`Error de sintaxis en ${file}:\n${result.stderr}`);
    process.exit(1);
  }
}
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
for (let i = 0; i < inlineScripts.length; i++) {
  const temp = path.join(root, `.munova-inline-check-${i}.js`);
  fs.writeFileSync(temp, inlineScripts[i][1]);
  const result = spawnSync(process.execPath, ['--check', temp], { encoding: 'utf8' });
  fs.rmSync(temp, { force: true });
  if (result.status !== 0) {
    console.error(`Error de sintaxis en script HTML ${i + 1}:\n${result.stderr}`);
    process.exit(1);
  }
}
console.log('MUNOVA preflight OK: estructura, vercel.json, secretos no incrustados y sintaxis comprobados.');
console.log('Nota: esto no prueba credenciales ni servicios externos; verifica Gemini desde la URL desplegada.');
