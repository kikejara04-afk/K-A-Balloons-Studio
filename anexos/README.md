# K&A Balloons Studio — Carpeta `anexos/`

Esta carpeta contiene todos los recursos estáticos del sitio web.  
Coloca los archivos en la subcarpeta correcta antes de publicar el sitio.

---

## 📁 Estructura

```
anexos/
└── images/
    ├── logo.svg            ✅ Incluido — logo principal (navbar y footer)
    ├── og-image.jpg        ⬜ Agrega — imagen Open Graph para redes (1200×630 px)
    ├── about.jpg           ⬜ Agrega — foto del equipo o taller (sección "Quiénes Somos")
    ├── hero-bg.jpg         ⬜ Opcional — imagen de fondo para el hero (si reemplazas el gradiente)
    │
    ├── portfolio/          ⬜ Carpeta recomendada para fotos de proyectos
    │   ├── prj-01.jpg      (min. 800×600 px, formato landscape)
    │   ├── prj-02.jpg
    │   └── ...             (una imagen por proyecto en portfolio.html)
    │
    ├── services/           ⬜ Carpeta recomendada para imágenes de servicios
    │   ├── eventos.jpg
    │   ├── regalos.jpg
    │   ├── arcos.jpg
    │   ├── disenos.jpg
    │   ├── corporativo.jpg
    │   └── premium.jpg
    │
    └── team/               ⬜ Carpeta recomendada para fotos del equipo
        ├── integrante-1.jpg
        └── integrante-2.jpg
```

---

## 🖼️ Recomendaciones para imágenes

| Imagen | Tamaño sugerido | Formato |
|---|---|---|
| `logo.svg` | Vectorial | SVG |
| `og-image.jpg` | 1200 × 630 px | JPG / WebP |
| `about.jpg` | 1000 × 700 px | JPG / WebP |
| Proyectos (portfolio) | 800 × 600 px o mayor | JPG / WebP |
| Servicios | 600 × 400 px | JPG / WebP |
| Equipo | 400 × 400 px (cuadrado) | JPG / WebP |

> **Tip de rendimiento:** Exporta imágenes en formato **WebP** con calidad 80–85 % para reducir el tamaño de descarga hasta un 30 % respecto a JPG.

---

## 🔗 Cómo referenciar imágenes en el HTML

```html
<!-- Ruta relativa desde la raíz del proyecto -->
<img src="anexos/images/about.jpg" alt="Equipo K&A Balloons Studio" width="800" height="600"/>

<!-- Proyecto de portfolio -->
<div class="port-item" data-full="anexos/images/portfolio/prj-01.jpg">
  <img src="anexos/images/portfolio/prj-01.jpg" alt="Decoración de cumpleaños"/>
</div>
```

---

## 🔥 Firebase — Configuración requerida

El archivo `js/auth.js` incluye un bloque de configuración de Firebase que **debes completar** con tus credenciales reales para activar el inicio de sesión:

```js
const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "tu-proyecto.firebaseapp.com",
  projectId:         "tu-proyecto",
  storageBucket:     "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

### Pasos para obtener la configuración:
1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Crea o abre tu proyecto.
3. **Configuración del proyecto** → **Tus apps** → **Agregar app** (icono `</>` para web).
4. Copia el objeto `firebaseConfig` y pégalo en `js/auth.js`.
5. En **Authentication → Sign-in method**, habilita **Email/Contraseña** y **Google**.

> Mientras la configuración sea `"TU_API_KEY"`, el sitio usa un **modo demo** sin backend real. Las sesiones se almacenan solo en `localStorage`.

---

## 📱 Redes Sociales — Actualiza los enlaces

Los siguientes placeholders aparecen en `index.html`, `services.html`, `portfolio.html`, `contact.html`:

| Red | Placeholder actual | Reemplaza con |
|---|---|---|
| Instagram | `instagram.com/kaballoonsstudio` | Tu perfil real |
| Facebook | `facebook.com/kaballoonsstudio` | Tu página real |
| TikTok | `tiktok.com/@kaballoonsstudio` | Tu perfil real |
| WhatsApp | `wa.me/573001234567` | Tu número: `wa.me/57XXXXXXXXXX` |
| Email | `info@kaballoonsstudio.com` | Tu correo real |
| Teléfono | `+57 300 123 4567` | Tu número real |

---

## 🗺️ Mapa de Google — Integración opcional

En `contact.html` hay un placeholder para el mapa. Para agregar uno real:

1. Ve a [Google Maps](https://maps.google.com) y busca tu ubicación.
2. Pulsa **Compartir** → **Incorporar un mapa** → Copia el `<iframe>`.
3. Reemplaza el bloque `<div class="map-placeholder">` con el iframe:

```html
<iframe
  src="TU_URL_DE_GOOGLE_MAPS_EMBED"
  width="100%" height="280"
  style="border:0; border-radius:1rem;"
  allowfullscreen loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="Ubicación K&A Balloons Studio">
</iframe>
```

---

*Actualizado: 2025 — K&A Balloons Studio*
