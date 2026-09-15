/**
 * Plantilla del service worker: lo que hace que la aplicación funcione sin conexión.
 *
 * NO se edita `publico/sw.js`, que es un artefacto derivado: se edita este fichero.
 * La construcción sustituye `ba54e88f8a5f` por el resumen del contenido y escribe `sw.js`.
 *
 * Es la pieza que sostiene el requisito RF-21. Un varadero no tiene cobertura, y una
 * herramienta de campo que necesite red para arrancar no se usa: se vuelve al papel.
 *
 * Estrategia elegida: **caché primero**. Se guarda una copia de la aplicación en la
 * instalación y a partir de ahí se sirve siempre desde ahí, sin consultar la red.
 *
 * Se elige así, y no «red primero con caché de reserva», porque en el barco la red no
 * suele estar ausente del todo: está *mal*. Una cobertura de una barra hace que cada
 * petición tarde treinta segundos en fracasar, y la aplicación parecería colgada. Yendo
 * a la caché directamente arranca igual de rápido con red que sin ella.
 *
 * El precio es que una versión nueva no se ve hasta el siguiente arranque, cuando el
 * service worker se actualiza. Para una herramienta de campo es el intercambio correcto:
 * la previsibilidad vale más que la inmediatez.
 *
 * Nota: este fichero no pasa por el empaquetador. Va en JavaScript directamente porque
 * el navegador lo carga aparte, como un programa independiente de la página.
 */

// El nombre de la caché lo inyecta `herramientas/sellar-sw.ts` durante la construcción,
// a partir de un resumen del contenido de la aplicación. Es la pieza que hace que una
// versión nueva llegue al dispositivo: si `app.js` o los estilos cambian, el nombre
// cambia, el navegador ve un service worker distinto y lo instala.
//
// Con un nombre fijo, como estaba al principio, la caché nunca se invalidaba y el
// inspector se quedaba con la primera versión que hubiera instalado para siempre. Se
// descubrió probando la aplicación con el servidor apagado: cargaba sin conexión, que
// era lo que se quería comprobar, pero cargaba la versión antigua.
const CACHE = "itb-campo-ba54e88f8a5f";

const RECURSOS = [
  "./",
  "./index.html",
  "./app.js",
  "./estilos.css",
  "./manifest.webmanifest",
  "./icono.svg",
  "./icono-180.png",
  "./icono-192.png",
  "./icono-512.png",
  "./icono-enmascarable-512.png",
  // El visor de la biblioteca (ADR-013). Va con la aplicación y no con los documentos:
  // sin él no se abre ninguno, aunque estén guardados.
  "./visor-pdf.js",
  "./pdfjs/pdf.worker.min.mjs",
  "./pdfjs/pdf_viewer.css",
];

// Los documentos de la biblioteca van en una caché aparte, con nombre fijo. Pesan unos
// 35 MB y no cambian con cada versión de la aplicación: si vivieran en la caché sellada,
// cada actualización los borraría y habría que volver a descargarlos. Que un PDF cambie lo
// resuelve su dirección, que lleva el resumen de su contenido (`?v=…`).
const CACHE_BIBLIOTECA = "itb-biblioteca";
const esDeBiblioteca = (url) => /\/(biblioteca|pdfjs)\//.test(new URL(url).pathname);

self.addEventListener("install", (evento) => {
  // `skipWaiting` hace que una versión nueva tome el control sin esperar a que se
  // cierren las pestañas antiguas.
  //
  // `cache: "reload"` va a la red saltándose la caché HTTP del navegador. Sin él, en GitHub
  // Pages (que sirve con max-age=600) la versión nueva del service worker se instalaba con
  // el app.js ANTERIOR, que seguía vigente en esa caché: caché sellada con el sello nuevo y
  // el contenido viejo. Pasó al publicar el 15/09/2026; en local no se ve porque el
  // servidor de desarrollo no manda max-age.
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(RECURSOS.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  // Al activarse una versión nueva se borran las cachés de versiones anteriores, para
  // que el dispositivo no acumule copias de la aplicación.
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves.filter((c) => c !== CACHE && c !== CACHE_BIBLIOTECA).map((c) => caches.delete(c)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;

  // Solo se atienden las lecturas. Nada de lo que hace esta aplicación se envía a
  // ningún sitio: los datos viven en el dispositivo.
  if (peticion.method !== "GET") return;

  // La biblioteca: de su caché si está; si no, de la red, y se guarda para la próxima.
  // No se devuelve la página principal si falla: un PDF que no hay no es una pantalla.
  if (esDeBiblioteca(peticion.url)) {
    evento.respondWith(
      caches.open(CACHE_BIBLIOTECA).then((cache) =>
        // En todas las cachés: el visor y su worker vienen precargados con la aplicación.
        caches.match(peticion).then(
          (guardada) =>
            guardada ??
            fetch(peticion).then((respuesta) => {
              if (respuesta.ok) cache.put(peticion, respuesta.clone());
              return respuesta;
            }),
        ),
      ),
    );
    return;
  }

  evento.respondWith(
    caches.match(peticion).then((guardada) => {
      if (guardada !== undefined) return guardada;

      // Si el recurso no estaba en la caché se intenta la red y se guarda para la
      // próxima. Si tampoco hay red, se devuelve la página principal: dentro de la
      // aplicación toda la navegación es interna, así que basta con ella.
      return fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          return respuesta;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
