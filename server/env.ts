/** Carga variables de entorno antes que cualquier otro módulo. Prioridad: sistema > .env.local > .env */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });
