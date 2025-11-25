// #region agent log
fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.js:start',message:'App entry point loading',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'unistyles-debug',hypothesisId:'A'})}).catch(()=>{});
// #endregion

import '../../../global.css';
import { registerRootComponent } from 'expo';
import App from './App';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.js:afterImports',message:'Imports completed',data:{hasApp:!!App},timestamp:Date.now(),sessionId:'debug-session',runId:'unistyles-debug',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
