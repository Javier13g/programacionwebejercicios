import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('[MAIN] main.ts ejecutado, arrancando bootstrap...');

bootstrapApplication(App, appConfig)
  .then(() => console.log('[MAIN] bootstrap OK'))
  .catch((err) => console.error('[MAIN] bootstrap ERROR:', err));
