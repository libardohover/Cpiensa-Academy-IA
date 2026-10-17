import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// Fuentes servidas desde la propia plataforma (sin solicitudes a terceros; licencia SIL OFL 1.1)
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
