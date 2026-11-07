import { Observable, NavigatedData, Page, CoreTypes, Utils, isAndroid } from '@nativescript/core';
import { enableLocationRequest, watchLocation, clearWatch, isEnabled } from '@nativescript/geolocation';

// Pregunta al sistema si el permiso de ubicación ya fue concedido.
// Android: checkSelfPermission (así funciona también cuando el permiso se da con adb).
// iOS: isEnabled() del plugin revisa la autorización de CoreLocation.
async function tienePermisoUbicacion(): Promise<boolean> {
  if (isAndroid) {
    const ctx: any = Utils.android.getApplicationContext();
    return ctx.checkSelfPermission('android.permission.ACCESS_FINE_LOCATION') === 0;
  }
  try {
    return await isEnabled();
  } catch (e) {
    return false;
  }
}

class GpsVM extends Observable {
  private watchId: number | null = null;
  private espera: any = null;

  constructor() {
    super();
    this.set('lat', 'Latitud: -');
    this.set('lon', 'Longitud: -');
    this.set('mensaje', 'Presiona el botón');
  }

  async obtener() {
    this.detener();
    try {
      if (!(await tienePermisoUbicacion())) {
        // false = solo "mientras se usa la app" (no pide ubicación en segundo plano)
        await enableLocationRequest(false);
      }
      this.set('mensaje', 'Buscando ubicación...');
      this.watchId = await watchLocation(
        (loc) => {
          this.set('lat', 'Latitud: ' + loc.latitude.toFixed(6));
          this.set('lon', 'Longitud: ' + loc.longitude.toFixed(6));
          this.set('mensaje', 'Precisión: ' + Math.round(loc.horizontalAccuracy) + ' m');
          this.detener(); // una sola lectura: se detiene el seguimiento
        },
        (err) => this.set('mensaje', 'Error: ' + err),
        {
          desiredAccuracy: CoreTypes.Accuracy.high,
          updateDistance: 0,
          minimumUpdateTime: 1000,
        }
      );
      // si en 20 segundos no llega ninguna ubicación, se avisa en pantalla
      this.espera = setTimeout(() => {
        if (this.watchId !== null) {
          this.detener();
          this.set('mensaje', 'No llegó ninguna ubicación en 20 s');
        }
      }, 20000);
    } catch (e) {
      this.set('mensaje', 'Error: ' + e);
    }
  }

  private detener() {
    if (this.watchId !== null) {
      clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.espera) {
      clearTimeout(this.espera);
      this.espera = null;
    }
  }
}

export function navigatingTo(args: NavigatedData) {
  (<Page>args.object).bindingContext = new GpsVM();
}
