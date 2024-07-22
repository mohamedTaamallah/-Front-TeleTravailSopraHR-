import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'app/app.module';
import { registerLicense } from '@syncfusion/ej2-base';

platformBrowserDynamic().bootstrapModule(AppModule)
                        .catch(err => console.error(err));
// Registering Syncfusion license key
registerLicense('ORg4AjUWIQA/Gnt2U1hhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTX5UdEdjUHpfdX1VR2Ve');