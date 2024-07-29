import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'app/app.module';
import { registerLicense } from '@syncfusion/ej2-base';

platformBrowserDynamic().bootstrapModule(AppModule)
                        .catch(err => console.error(err));

                        
// Registering Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF1cWGhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEFjXn1XcXVVRmFYUERxXQ==');
