# Ejercicio 1. Lectura simple de GPS (NativeScript, Android + iOS)

Ejercicio de contexto de la práctica **M3. Mini-práctica resuelta** (Aplicaciones Móviles y Laboratorio).
La app pide el permiso de ubicación y, al presionar un botón, muestra la latitud, la longitud y la precisión.

Esta guía explica cómo construir el proyecto desde cero, paso a paso. Está pensada para las Macs de los salones (con Android Studio, Xcode y Visual Studio Code instalados), pero también trae los comandos para Windows por si quieres practicar en casa.

## Cómo leer los comandos de esta guía

Cada paso trae dos bloques de comandos:

- **macOS (Terminal)**: en la Mac abre *Terminal* (Cmd + Espacio, escribe "Terminal" y Enter) o la terminal integrada de VS Code (*Terminal > New Terminal*). Usa `zsh`.
- **Windows (PowerShell)**: abre *PowerShell* desde el menú Inicio o la terminal integrada de VS Code.

Copia el bloque que corresponde a tu sistema y pégalo en la terminal. Las líneas que empiezan con `#` son comentarios y no se ejecutan. iOS solo se puede compilar en Mac, así que los pasos de iOS no tienen versión de PowerShell.

## Parte 1. Preparar la computadora (solo la primera vez)

### Mac del salón

1. Abre **Android Studio** una vez para que termine de instalar el SDK. En *More Actions > Virtual Device Manager* crea un emulador (por ejemplo *Pixel*) si no hay ninguno.
2. Abre **Xcode** una vez, acepta la licencia y en *Settings > Components* descarga el simulador de iOS si no aparece. En *Settings > Locations*, en *Command Line Tools*, elige la versión de Xcode instalada (si la lista está vacía, iOS no compila).
3. Revisa que esté Node.js. En las Macs del salón no hace falta Homebrew: Java 21 ya viene instalado.

```bash
# macOS (Terminal)
node -v              # debe mostrar v20 o mayor
```

4. Instala la CLI de NativeScript y revisa la computadora con `ns doctor`:

```bash
# macOS (Terminal)
npm install -g nativescript
ns --version
ns doctor
```

5. Para iOS, instala las herramientas de línea de comandos de Xcode y CocoaPods. `sudo` pide la contraseña de administrador.

```bash
# macOS (Terminal)
xcode-select --install
sudo gem install cocoapods
pod --version
```

6. Vuelve a ejecutar `ns doctor`. No debe marcar errores.

7. Si `ns doctor` muestra un aviso sobre `ANDROID_HOME` o `adb`, revisa primero qué Java tienes:

```bash
# macOS (Terminal)
java -version        # debe mostrar 21.x
```

Luego abre el archivo de configuración de la terminal:

```bash
# macOS (Terminal)
nano ~/.zshrc
```

Agrega al final estas líneas:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

`$HOME` es tu carpeta de usuario; en las Macs del salón es `/Users/Alumnos`. Guarda con Ctrl + O, Enter, y sal con Ctrl + X. Después carga los cambios y revisa Android:

```bash
# macOS (Terminal)
source ~/.zshrc
ns doctor android
```

Como quedan en `~/.zshrc`, estas variables se cargan en cada terminal nueva y en la Mac puedes saltarte la Parte 2.

8. Para abrir VS Code desde la terminal con `code .`: en VS Code presiona Cmd + Shift + P, escribe `Shell Command: Install 'code' command in PATH` y Enter.

### Windows (en casa, solo Android)

Necesitas Node.js 20 o mayor (recomendado 22 LTS), Android Studio y Git.

```powershell
# Windows (PowerShell)
node -v                     # debe mostrar v20 o mayor
winget install Git.Git      # si no tienes Git
# Android Studio: descárgalo de https://developer.android.com/studio,
# ábrelo una vez y crea un emulador en Virtual Device Manager
```

En Android Studio, en *Settings > Languages & Frameworks > Android SDK*, revisa que haya al menos una versión reciente marcada en *SDK Platforms* y que en *SDK Tools* estén instalados *Android SDK Build-Tools* y *Android SDK Platform-Tools*. El manual oficial de NativeScript pide los dos.

> Trabaja en una ruta sin espacios ni acentos, por ejemplo `C:\proyectos`. Con rutas como `...\Apps Móviles\...` Gradle falla con *Non-ASCII characters in path*.

## Parte 2. Avisarle a la terminal dónde están Android y Java

Si en la Mac ya agregaste las variables a `~/.zshrc` (Parte 1, paso 7), sáltate esta parte.

NativeScript necesita saber dónde está el SDK de Android y el Java que trae Android Studio. Estas variables duran mientras la terminal esté abierta; si la cierras, vuelve a ejecutar el bloque.

NativeScript recomienda Java 21: con versiones más nuevas el Gradle que usa puede fallar. Las versiones recientes de Android Studio traen Java 21, pero revisa lo que muestra `java -version`. Si en Windows sale otra versión, instala JDK 21 con `winget install EclipseAdoptium.Temurin.21.JDK` y usa esa carpeta en `JAVA_HOME`.

```bash
# macOS (Terminal)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# Comprueba que funcionen
java -version        # debe mostrar 21.x
adb version
```

```powershell
# Windows (PowerShell)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"

# Comprueba que funcionen
java -version        # debe mostrar 21.x
adb version
```

## Parte 3. Crear el proyecto paso a paso

### Paso 1. Crear la carpeta de trabajo y el proyecto

La guía usa `npx nativescript`, que funciona aunque la CLI no esté instalada de forma global. La opción `--ts` crea el proyecto con TypeScript. Si instalaste la CLI con `npm install -g nativescript` (Parte 1 en Mac), puedes escribir `ns` en lugar de `npx nativescript` en todos los comandos: por ejemplo `ns create Ejercicio1GPS --ts` y, en la Parte 4, `ns run android`.

```bash
# macOS (Terminal)
mkdir -p ~/proyectos
cd ~/proyectos
npx --yes nativescript create Ejercicio1GPS --ts
cd Ejercicio1GPS
```

```powershell
# Windows (PowerShell)
New-Item -ItemType Directory -Force C:\proyectos
cd C:\proyectos
npx --yes nativescript create Ejercicio1GPS --ts
cd Ejercicio1GPS
```

Si te pregunta si quieres compartir estadísticas de uso, responde lo que prefieras. Al terminar tendrás una carpeta `Ejercicio1GPS` con `app/`, `App_Resources/` y `package.json`.

### Paso 2. Instalar el plugin de geolocalización

```bash
# macOS (Terminal), dentro de la carpeta Ejercicio1GPS
npx nativescript plugin add @nativescript/geolocation
```

```powershell
# Windows (PowerShell), dentro de la carpeta Ejercicio1GPS
npx nativescript plugin add @nativescript/geolocation
```

El comando agrega `@nativescript/geolocation` a `package.json` y lo descarga en `node_modules`.

### Paso 3. Abrir el proyecto en VS Code

```bash
# macOS (Terminal)
code .
```

```powershell
# Windows (PowerShell)
code .
```

Si `code` no funciona, abre VS Code y usa *File > Open Folder...* para elegir la carpeta `Ejercicio1GPS`.

### Paso 4. Crear los archivos de la pantalla del GPS

```bash
# macOS (Terminal)
mkdir -p app/ejercicios
touch app/ejercicios/gps-page.xml app/ejercicios/gps-page.ts
```

```powershell
# Windows (PowerShell)
New-Item -ItemType Directory -Force app\ejercicios
New-Item -ItemType File app\ejercicios\gps-page.xml, app\ejercicios\gps-page.ts
```

### Paso 5. Escribir la interfaz (`app/ejercicios/gps-page.xml`)

Abre el archivo en VS Code y pega esto:

```xml
<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatingTo="navigatingTo">
  <ActionBar title="Ejercicio 1: GPS simple" />
  <StackLayout class="p-20">
    <Label text="{{ lat }}" class="h2" />
    <Label text="{{ lon }}" class="h2" />
    <Label text="{{ mensaje }}" textWrap="true" class="m-y-10" />
    <Button text="Obtener mi ubicación" tap="{{ obtener }}" />
  </StackLayout>
</Page>
```

Qué hace cada parte:

- `navigatingTo="navigatingTo"` llama a la función `navigatingTo` del archivo `.ts` antes de mostrar la pantalla. Ahí se conecta el modelo de vista.
- `{{ lat }}`, `{{ lon }}` y `{{ mensaje }}` son *bindings*: la etiqueta muestra el valor que tenga esa propiedad en el modelo y se actualiza sola cuando cambia.
- `tap="{{ obtener }}"` ejecuta el método `obtener()` del modelo al presionar el botón.

### Paso 6. Escribir la lógica (`app/ejercicios/gps-page.ts`)

Pega esto en `app/ejercicios/gps-page.ts`:

```ts
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
```

Cómo funciona, en orden:

1. `navigatingTo` crea un `GpsVM` y lo asigna como `bindingContext` de la página. Desde ese momento los `{{ ... }}` del XML leen sus propiedades.
2. `GpsVM` hereda de `Observable`. Cada `this.set('lat', ...)` avisa a la interfaz que el valor cambió y la etiqueta se redibuja.
3. Al presionar el botón, `obtener()` revisa el permiso con `tienePermisoUbicacion()`. Si no está concedido, `enableLocationRequest(false)` muestra el diálogo del sistema. El `false` pide la ubicación solo mientras se usa la app; con `true`, Android 10+ también pide ubicación en segundo plano y falla porque ese permiso no está en el manifiesto.
4. `watchLocation` empieza a recibir ubicaciones. En la primera que llega se escriben latitud, longitud y precisión, y `detener()` corta el seguimiento para no gastar batería.
5. El `setTimeout` de 20 s avisa en pantalla si el GPS no respondió (por ejemplo, si el emulador no tiene ubicación configurada).

### Paso 7. Hacer que la app abra la pantalla del GPS

Abre `app/app-root.xml` y deja solo esta línea:

```xml
<Frame defaultPage="ejercicios/gps-page" />
```

`defaultPage` es la ruta de la página, relativa a `app/` y sin extensión.

### Paso 8. Declarar el permiso de ubicación en Android

Abre `App_Resources/Android/src/main/AndroidManifest.xml` y, junto a las otras líneas `<uses-permission ... />` (antes de `<application`), agrega:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

Sin estas líneas Android no muestra el diálogo de permiso y la app nunca recibe ubicaciones.

### Paso 9. Declarar el permiso de ubicación en iOS

Abre `App_Resources/iOS/Info.plist` y, dentro de `<dict>`, agrega:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>La app necesita tu ubicación para mostrar tu latitud y longitud.</string>
```

iOS muestra ese texto en el diálogo de permiso. Si falta la clave, iOS no pide el permiso.

## Parte 4. Ejecutar la app

La primera compilación tarda varios minutos porque descarga Gradle (Android) o los pods (iOS). Después, cada vez que guardas un archivo la app se recarga sola. Para detenerla, haz clic en la terminal y presiona Ctrl + C.

### En el emulador de Android

1. Abre Android Studio, ve a *Virtual Device Manager* y arranca el emulador con el botón de play.
2. Recuerda haber ejecutado el bloque de la Parte 2 en esta terminal.
3. Ejecuta:

```bash
# macOS (Terminal)
adb devices                              # debe aparecer emulator-5554 o similar
npx nativescript run android --emulator
```

```powershell
# Windows (PowerShell)
adb devices                              # debe aparecer emulator-5554 o similar
npx nativescript run android --emulator
```

### En el simulador de iPhone (solo Mac)

```bash
# macOS (Terminal)
npx nativescript run ios --emulator
```

El simulador de iPhone se abre solo y se instala la app. Si falla en el paso de `pod install`, revisa que `pod --version` funcione (Parte 1).

### Si algo no compila

```bash
# macOS (Terminal)
npx nativescript doctor      # revisa qué falta en la computadora
npx nativescript clean       # borra la compilación anterior
```

```powershell
# Windows (PowerShell)
npx nativescript doctor android
npx nativescript clean
```

## Parte 5. Probar el GPS con una ubicación simulada

Los emuladores no tienen GPS real, así que hay que darles una ubicación. Estos ejemplos usan las coordenadas del Zócalo de la CDMX.

### Android

Con la app ya instalada, en otra terminal (con las variables de la Parte 2):

```bash
# macOS (Terminal)
adb shell pm grant org.nativescript.Ejercicio1GPS android.permission.ACCESS_FINE_LOCATION
adb shell pm grant org.nativescript.Ejercicio1GPS android.permission.ACCESS_COARSE_LOCATION
adb emu geo fix -99.1332 19.4326
```

```powershell
# Windows (PowerShell)
adb shell pm grant org.nativescript.Ejercicio1GPS android.permission.ACCESS_FINE_LOCATION
adb shell pm grant org.nativescript.Ejercicio1GPS android.permission.ACCESS_COARSE_LOCATION
adb emu geo fix -99.1332 19.4326
```

Los dos primeros comandos conceden el permiso sin pasar por el diálogo (también puedes aceptarlo en la app). `geo fix` recibe primero la longitud y después la latitud. Otra opción es el menú del emulador: *Extended Controls (...) > Location*.

Presiona **Obtener mi ubicación**: debe mostrar latitud `19.432600`, longitud `-99.133200` y la precisión.

### iOS (solo Mac)

```bash
# macOS (Terminal)
xcrun simctl location booted set 19.4326,-99.1332
```

También sirve el menú del simulador: *Features > Location > Custom Location...* con `19.4326` y `-99.1332`. Presiona el botón y acepta el permiso cuando aparezca.

### Celular Android real

Usa una app de ubicación simulada (por ejemplo iMockGo) configurada en *Opciones de desarrollador > App de ubicación simulada*.

## Archivos importantes

| Archivo | Qué hace |
|---|---|
| `app/ejercicios/gps-page.xml` | Pantalla: tres etiquetas (latitud, longitud, mensaje) y un botón. |
| `app/ejercicios/gps-page.ts` | Modelo de vista `GpsVM`: revisa el permiso, inicia `watchLocation`, toma la primera lectura y se detiene (aviso si no llega nada en 20 s). |
| `app/app-root.xml` | Abre `ejercicios/gps-page` al iniciar. |
| `App_Resources/Android/src/main/AndroidManifest.xml` | Permisos `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION`. |
| `App_Resources/iOS/Info.plist` | `NSLocationWhenInUseUsageDescription` (texto que iOS muestra al pedir la ubicación). |

## Cambios respecto al reporte (para que funcione en Android e iOS)

- La revisión del permiso usa `checkSelfPermission` solo en Android; en iOS usa `isEnabled()` del plugin (`Utils.android` no existe en iOS).
- `enableLocationRequest(false)` en vez de `true`: con `true`, en Android 10+ también se pide ubicación en segundo plano, permiso que no está en el manifiesto y que provocaba el error *User denied location permission previously*.

## Si no llegaste a algún paso: descarga el proyecto terminado

El proyecto completo está en GitHub: https://github.com/Lastcreator999/Ejercicio1GPS

Puedes descargarlo de dos formas:

- Sin Git: en la página del repositorio, botón verde **Code > Download ZIP**, y descomprime el archivo.
- Con Git:

```bash
# macOS (Terminal)
cd ~/proyectos
git clone https://github.com/Lastcreator999/Ejercicio1GPS.git Ejercicio1GPS-terminado
cd Ejercicio1GPS-terminado
npm install
```

```powershell
# Windows (PowerShell)
cd C:\proyectos
git clone https://github.com/Lastcreator999/Ejercicio1GPS.git Ejercicio1GPS-terminado
cd Ejercicio1GPS-terminado
npm install
```

La versión del repositorio trae su propia CLI de NativeScript y el script `scripts/ejecutar.js`, que busca solo el SDK de Android y el Java de Android Studio, así que no hace falta la Parte 2:

| Comando | Qué hace |
|---|---|
| `npm run android` | Ejecuta en el emulador de Android Studio |
| `npm run ios` | Ejecuta en el simulador de iPhone (solo Mac) |
| `npm run ios:iphone` | Ejecuta en un iPhone conectado por cable (solo Mac) |
| `npm run doctor` | Revisa que la computadora tenga todo instalado |
| `npm run limpiar` | Borra la compilación; úsalo si algo se "atora" o al cambiar entre simulador e iPhone real |

En VS Code también puedes presionar Cmd + Shift + B (Mac) o Ctrl + Shift + B (Windows) y elegir Android, iOS o iPhone real.

Si tampoco tienes Mac, el workflow de GitHub Actions (`.github/workflows/compilar.yml`) compila Android e iOS en cada `git push`; en la pestaña **Actions** puedes descargar el APK y el `.zip` del simulador de iOS.

Si solo te falta un paso, puedes copiar ese archivo del repositorio a tu proyecto en vez de descargar todo.
