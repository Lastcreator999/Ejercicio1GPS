# Ejercicio 1 · Lectura simple de GPS (NativeScript, Android + iOS)

Ejercicio de contexto de la práctica **M3. Mini-práctica resuelta** (Aplicaciones Móviles y Laboratorio).
Pide el permiso de ubicación y muestra la **latitud**, la **longitud** y la **precisión** al presionar un botón.

## Archivos importantes

| Archivo | Qué hace |
|---|---|
| `app/ejercicios/gps-page.xml` | Pantalla: tres etiquetas (latitud, longitud, mensaje) y un botón. |
| `app/ejercicios/gps-page.ts` | Modelo de vista `GpsVM`: revisa el permiso, inicia `watchLocation`, toma la primera lectura y se detiene (aviso si no llega nada en 20 s). |
| `app/app-root.xml` | Abre `ejercicios/gps-page` al iniciar. |
| `App_Resources/Android/src/main/AndroidManifest.xml` | Permisos `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION`. |
| `App_Resources/iOS/Info.plist` | `NSLocationWhenInUseUsageDescription` (texto que iOS muestra al pedir la ubicación). |

Plugin: `@nativescript/geolocation`.

## 1. Preparar la computadora (una sola vez, Windows)

Necesitas: **Node.js 22 LTS**, **JDK 21**, **Android Studio** (solo para el SDK y el emulador) y **Git**.

```powershell
# Node y la CLI de NativeScript
node -v
npm install -g nativescript

# JDK 21 (Gradle no funciona con Java 25)
winget install EclipseAdoptium.Temurin.21.JDK

# Variable del SDK de Android (cierra y abre la terminal después)
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

# Revisa que todo esté bien; debe salir sin errores rojos
ns doctor android
```

> ⚠️ Clona el proyecto en una ruta **sin espacios ni acentos**, por ejemplo `C:\proyectos`. Con rutas como `...\Apps Móviles\...` Gradle falla con *Non-ASCII characters in path*.

## 2. Descargar y ejecutar en Android

```powershell
cd C:\proyectos
git clone https://github.com/TU_USUARIO/Ejercicio1GPS.git
cd Ejercicio1GPS
npm install
```

1. Abre **Android Studio > More Actions > Virtual Device Manager** y arranca un emulador (o conecta tu celular con *Depuración USB* activada).
2. Verifica que aparezca el dispositivo: `adb devices`
3. Ejecuta: `ns run android`

La primera compilación tarda varios minutos (descarga Gradle y dependencias). Después, cada vez que guardas un archivo la app se recarga sola.

Para generar el APK e instalarlo en un celular:

```powershell
ns build android
adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

## 3. iOS (iPhone)

El código ya está adaptado para iOS (permisos en `App_Resources/iOS/Info.plist`), pero **compilar para iOS requiere una Mac con Xcode**; Windows no puede hacerlo. Opciones:

- **Con una Mac** (laboratorio de la escuela, prestada o rentada en la nube): instala Xcode desde la App Store, abre Xcode una vez para aceptar la licencia, y luego:
  ```bash
  npm install -g nativescript
  ns doctor ios
  npm install
  ns run ios
  ```
  Esto abre el **Simulador de iPhone** que viene con Xcode (no necesitas un iPhone).
- **Sin Mac:** este repositorio trae un workflow de **GitHub Actions** (`.github/workflows/compilar.yml`) que compila la versión de iOS en una Mac de GitHub cada vez que haces `git push`. En la pestaña **Actions** verás si compiló bien y podrás descargar el APK de Android y el `.zip` del simulador de iOS. Ese `.zip` se puede subir a un servicio de simulador en el navegador como [Appetize.io](https://appetize.io) para ver la app corriendo como iPhone.

## 4. Probar el ejercicio

**Android (emulador)** – con la app ya instalada, en otra terminal:

```powershell
adb shell pm grant org.nativescript.Ejercicio1GPS android.permission.ACCESS_FINE_LOCATION
adb shell pm grant org.nativescript.Ejercicio1GPS android.permission.ACCESS_COARSE_LOCATION
adb emu geo fix -99.1332 19.4326
```

Presiona **Obtener mi ubicación**: debe mostrar latitud `19.432600`, longitud `-99.133200` y la precisión (coordenadas del Zócalo). También puedes cambiar la ubicación en el emulador en *Extended Controls (⋯) > Location*.

**iOS (simulador)** – en la Mac: menú del Simulador *Features > Location > Custom Location…* y escribe `19.4326`, `-99.1332`, o en terminal:

```bash
xcrun simctl location booted set 19.4326,-99.1332
```

**Celular Android real:** usa una app de ubicación simulada (por ejemplo iMockGo) configurada en *Opciones de desarrollador > App de ubicación simulada*.

## Cambios respecto al reporte (para que funcione en Android e iOS)

- La revisión del permiso usa `checkSelfPermission` solo en Android; en iOS usa `isEnabled()` del plugin (`Utils.android` no existe en iOS).
- `enableLocationRequest(false)` en lugar de `true`: con `true`, en Android 10+ también se pide ubicación **en segundo plano**, permiso que no está en el manifiesto y que provocaba el error *User denied location permission previously*.
