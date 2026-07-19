# Evy · Galería Interactiva

Galería fotográfica con álbumes de viajes temáticos. Interfaz inmersiva con animaciones fluidas, lightbox, álbumes protegidos y reproductor de música ambiental.

## Estructura

```
evy/
├── index.html         # Entrada principal
├── style.css          # Estilos globales
├── gallery-meta.js    # Metadatos de fotos (ratios, descripciones)
├── music.mp3          # Música ambiental
├── src/
│   ├── main.js        # Punto de entrada, inicialización
│   ├── data.js        # Datos de fotos, álbumes, seguridad
│   ├── helpers.js     # Utilidades, cursor personalizado
│   ├── spawn.js       # Animación de tarjetas flotantes
│   ├── gallery.js     # Modal de navegación y cuadrículas
│   ├── lock.js        # Modal de contraseña para álbumes
│   ├── lightbox.js    # Visor de imágenes/vídeos
│   └── audio.js       # Reproductor de música
├── assets/fotos/      # Archivos multimedia
└── .gitignore
```

## Cómo ejecutar

Usa un servidor local (los módulos ES requieren HTTP, no `file://`):

```bash
python3 -m http.server 8080
# o
npx serve .
```

Abre `http://localhost:8080` en el navegador.

## Funcionalidades

- **Spawn loop**: Fotos flotando con animación de entrada/salida
- **Galería**: Vista de álbumes (carpetas) y rejilla de fotos
- **Lightbox**: Visor con metadatos y reproducción de vídeo
- **Álbumes protegidos**: Acceso mediante contraseña (sesión)
- **Cursor personalizado**: Efecto hover en escritorio
- **Música ambiental**: Control toggle con icono dinámico
- **Responsive**: Adaptado a móvil, tablet y escritorio

## Tecnología

HTML, CSS y JavaScript vanilla (ES Modules nativos). Sin dependencias ni build tools.
