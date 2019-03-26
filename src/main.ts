import './polyfills';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { UiKitModule } from './app/ui-kit.module';

platformBrowserDynamic()
  .bootstrapModule(UiKitModule)
  .then(ref => {
    // Ensure Angular destroys itself on hot reloads.
    if (window[`ngRef`]) {
      window[`ngRef`].destroy();
    }
    window[`ngRef`] = ref;

    // Otherwise, log the boot error
  })
  .catch(err => window.console.error(err));
