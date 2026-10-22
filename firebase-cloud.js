const CONFIG_KEY='munova.firebase.config';
const SDK_URLS=['https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js','https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js','https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'];
let SDK=null,loadSDKPromise=null;
async function loadSDK(){if(SDK)return SDK;if(!loadSDKPromise){loadSDKPromise=Promise.all(SDK_URLS.map(u=>import(u))).then(([appMod,authMod,storeMod])=>SDK={...appMod,...authMod,...storeMod}).catch(e=>{loadSDKPromise=null;throw new Error('No se pudo cargar Firebase. Revisa la conexión a internet: '+e.message)})}return loadSDKPromise}

const WORKSPACE='main';
const CHUNK_SIZE=200000;
const WRITER='w_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
let app=null,auth=null,db=null,user=null,unsubscribe=null,connected=false,syncReady=false,pushTimer=null,pushing=false,applying=false,lastChunks=[],lastStatus='Sin conectar';
const status=(message,good=false)=>{lastStatus=message;window.MunovaCloudStatus=message;const el=document.getElementById('cloudStatus');if(el){el.className=good?'successnotice':'notice';el.textContent=message;}const badge=document.querySelector('.statuspill');if(badge){badge.textContent=connected?'● NUBE SINCRONIZADA':'● SESIÓN LOCAL';}};
function getCfg(){try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')}catch{return {}}}
async function init(cfg){
  const sdk=await loadSDK();
  const current=sdk.getApps().find(a=>a.name==='MUNOVA_CLOUD');
  if(current){app=current;auth=sdk.getAuth(app);db=sdk.getFirestore(app);return}
  app=sdk.initializeApp(cfg,'MUNOVA_CLOUD');auth=sdk.getAuth(app);db=sdk.getFirestore(app);
  sdk.onAuthStateChanged(auth,async u=>{
    user=u||null;connected=!!u;syncReady=false;
    if(!u){if(unsubscribe){unsubscribe();unsubscribe=null}status('Firebase configurado, pero no hay sesión iniciada.');return}
    status(`Conectado como ${u.email||u.uid}. Preparando sincronización…`,true);
    try{await startListener()}catch(e){syncReady=false;status('No se pudo iniciar sincronización: '+friendly(e))}
  });
}
function doc(...args){return SDK.doc(...args)}
function getDoc(...args){return SDK.getDoc(...args)}
function setDoc(...args){return SDK.setDoc(...args)}
function deleteDoc(...args){return SDK.deleteDoc(...args)}
function collection(...args){return SDK.collection(...args)}
function onSnapshot(...args){return SDK.onSnapshot(...args)}
function serverTimestamp(...args){return SDK.serverTimestamp(...args)}
function createUserWithEmailAndPassword(...args){return SDK.createUserWithEmailAndPassword(...args)}
function signInWithEmailAndPassword(...args){return SDK.signInWithEmailAndPassword(...args)}
function signOut(...args){return SDK.signOut(...args)}
function refs(){if(!user)throw new Error('Inicia sesión en Firebase primero.');const root=`users/${user.uid}/workspaces/${WORKSPACE}`;return {meta:doc(db,root,'meta'),chunks:collection(db,root,'chunks'),root}}
function cleanState(){const s=JSON.parse(JSON.stringify(window.MunovaGetState()));if(s.settings)s.settings.accessCode='';if(s.viewer?.url?.startsWith('blob:'))s.viewer.url='';if(s.handbook?.pages?.length&&!s.handbook.text)s.handbook.text=s.handbook.pages.join('\n\n');return s}
function splitText(str){const chunks=[];for(let i=0;i<str.length;i+=CHUNK_SIZE)chunks.push(str.slice(i,i+CHUNK_SIZE));return chunks.length?chunks:['{}']}
async function pull(metaData){
  const r=refs();const n=Math.min(Number(metaData.chunkCount)||0,200);
  if(!n)return null;
  const parts=[];
  for(let i=0;i<n;i++){const snap=await getDoc(doc(db,r.root,'chunks',`c${i}`));if(!snap.exists())throw new Error(`Falta el bloque ${i+1} de ${n}.`);parts.push(snap.data().text||'')}
  const state=JSON.parse(parts.join(''));
  if(state.viewer?.url?.startsWith('blob:'))state.viewer.url='';
  if(state.handbook?.pages?.length&&!state.handbook.text)state.handbook.text=state.handbook.pages.join('\n\n');
  return state;
}
async function startListener(){
  if(unsubscribe){unsubscribe();unsubscribe=null}
  const r=refs();
  const first=await getDoc(r.meta);
  if(!first.exists()){
    status('Cuenta conectada. Creando el workspace con los datos de este dispositivo…',true);
    syncReady=true;if(!await pushCurrent()){syncReady=false;return}
  }else{
    try{const data=first.data();const remote=await pull(data);if(remote){applying=true;window.MunovaApplyCloudState(remote);applying=false;lastChunks=splitText(JSON.stringify(cleanState()));}syncReady=true;}
    catch(e){syncReady=false;status('Conectado, pero no se pudo descargar el workspace: '+e.message);return}
  }
  unsubscribe=onSnapshot(r.meta,async snap=>{
    if(!snap.exists())return;const m=snap.data();if(m.writerId===WRITER||applying)return;
    try{status('Hay cambios en otro dispositivo. Sincronizando…',true);const remote=await pull(m);if(remote){applying=true;window.MunovaApplyCloudState(remote);applying=false;lastChunks=splitText(JSON.stringify(cleanState()));status(`Sincronizado · ${user.email||'cuenta'} · ${m.updatedAt?.toDate?.().toLocaleTimeString?.()||'ahora'}`,true)}}catch(e){applying=false;status('Error al recibir cambios: '+e.message)}
  },e=>status('Error de escucha en Firestore: '+e.message));
  connected=true;status(`Nube conectada · ${user.email||user.uid}. Cambios automáticos activos.`,true);
}
async function pushCurrent(){
  if(!user||!db||pushing||applying||!syncReady)return;
  pushing=true;
  try{
    const r=refs();const json=JSON.stringify(cleanState());const chunks=splitText(json);
    const changed=[];for(let i=0;i<chunks.length;i++){if(lastChunks[i]!==chunks[i])changed.push(i)}
    for(const i of changed){await setDoc(doc(db,r.root,'chunks',`c${i}`),{text:chunks[i],updatedAt:serverTimestamp()})}
    for(let i=chunks.length;i<lastChunks.length;i++){await deleteDoc(doc(db,r.root,'chunks',`c${i}`)).catch(()=>{})}
    if(changed.length||chunks.length!==lastChunks.length){await setDoc(r.meta,{chunkCount:chunks.length,writerId:WRITER,updatedAt:serverTimestamp(),schemaVersion:1})}
    lastChunks=chunks;status(`Sincronizado · ${user.email||'cuenta'} · ${new Date().toLocaleTimeString()}`,true);return true;
  }catch(e){status('La nube no pudo guardar los cambios: '+e.message);return false;}
  finally{pushing=false}
}
function schedulePush(){if(!user||applying||!syncReady)return;clearTimeout(pushTimer);pushTimer=setTimeout(()=>pushCurrent(),1800)}
async function connect({cfg,email,password,create}){
  try{localStorage.setItem(CONFIG_KEY,JSON.stringify(cfg));await init(cfg);if(create){await createUserWithEmailAndPassword(auth,email,password);status('Cuenta creada. Iniciando sincronización…',true)}else{await signInWithEmailAndPassword(auth,email,password);status('Sesión iniciada. Sincronizando workspace…',true)}}catch(e){status('No se pudo conectar: '+friendly(e));throw e}finally{const p=document.getElementById('fbPassword');if(p)p.value=''}
}
function friendly(e){const m=e?.code||e?.message||'error desconocido';const map={'auth/email-already-in-use':'Ese correo ya tiene cuenta. Pulsa “Iniciar sesión”.','auth/invalid-credential':'Correo o contraseña incorrectos.','auth/weak-password':'La contraseña debe tener al menos 6 caracteres.','auth/invalid-email':'El correo no parece válido.','auth/operation-not-allowed':'Activa Email/Password en Firebase Authentication.','permission-denied':'Firestore rechazó el acceso. Revisa que hayas publicado las reglas de seguridad incluidas.'};return map[m]||m}
async function logout(){if(!auth||!user){status('No hay sesión en la nube.');return}try{if(unsubscribe){unsubscribe();unsubscribe=null}await signOut(auth);connected=false;syncReady=false;user=null;status('Sesión de nube cerrada. Los datos locales no se borraron.',true)}catch(e){status('No se pudo cerrar sesión: '+friendly(e))}}
async function syncNow(){if(!user){status('Inicia sesión en Firebase antes de sincronizar.');return}if(!syncReady){await startListener();if(!syncReady)return}await pushCurrent()}
window.MunovaCloud={connect,logout,syncNow,schedulePush,isConnected:()=>connected,getStatus:()=>lastStatus};
const saved=getCfg();if(saved.apiKey&&saved.authDomain&&saved.projectId&&saved.appId){init(saved).catch(e=>status('Configuración Firebase guardada, pero no se pudo iniciar: '+e.message))}
