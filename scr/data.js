import { GALLERY_META } from '../gallery-meta.js';

export const PROTECTED_ALBUMS = { Ella: '27-12-25' };
export const UNLOCK_STORAGE_KEY = 'evy_unlocked_albums';

export function isProtectedAlbum(name) {
  return name in PROTECTED_ALBUMS;
}

export function isAlbumUnlocked(name) {
  if (!isProtectedAlbum(name)) return true;
  try {
    const stored = JSON.parse(sessionStorage.getItem(UNLOCK_STORAGE_KEY) || '[]');
    return stored.includes(name);
  } catch {
    return false;
  }
}

export function unlockAlbum(name) {
  try {
    const list = JSON.parse(sessionStorage.getItem(UNLOCK_STORAGE_KEY) || '[]');
    if (!list.includes(name)) {
      list.push(name);
      sessionStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('[Evy] No se pudo guardar el desbloqueo en sessionStorage:', e);
  }
}

export function normalizeAlbumPassword(value) {
  return value.trim().replace(/\s/g, '');
}

export function isAlbumPasswordValid(albumName, value) {
  const expected = PROTECTED_ALBUMS[albumName];
  if (!expected) return true;
  const entered = normalizeAlbumPassword(value);
  return entered === expected || entered === expected.replace(/-/g, '');
}

const RAW_PHOTOS = [
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.01 (1).jpeg", aspect: "portrait", album: "Viajes", country: "Italia", place: "Milán", title: "Duomo de Milán", desc: "La catedral gótica se alza entre la plaza y el cielo azul de primavera." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.01.jpeg", aspect: "portrait", album: "Viajes", country: "Italia", place: "Milán", title: "Galleria Vittorio Emanuele", desc: "Bajo la cúpula de cristal, la elegancia milanesa se refleja en cada arco." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.05 (1).jpeg", aspect: "landscape", album: "Viajes", country: "Italia", place: "Milán", title: "Piazza del Duomo", desc: "El corazón de Milán late entre turistas, fachadas y la gran entrada de la galería." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.05 (2).jpeg", aspect: "portrait", album: "Viajes", country: "Italia", place: "Milán", title: "Castello Sforzesco", desc: "Ladrillo rojo y reloj antiguo: la historia milanesa vigila desde sus torres." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.05 (3).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Milán", title: "Arco della Pace", desc: "Un arco triunfal que cierra el paseo con majestad neoclásica." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.05 (4).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Milán", title: "Entre pisos", desc: "Un instante íntimo capturado en el ascensor, camino de la siguiente aventura." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.05 (5).jpeg", aspect: "landscape", album: "Cultura", country: "Italia", place: "Milán", title: "Duomo al anochecer", desc: "Cuando cae la noche, el mármol blanco brilla como si aún fuera de día." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.05.jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Milán", title: "La catedral y la plaza", desc: "Multitudes, campanarios y la eterna silueta del Duomo." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (1).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Milán", title: "Arte en la ciudad", desc: "Esculturas de colores dialogan con la fachada de un edificio histórico." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (2).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Como", title: "Orillas del lago", desc: "Agua, montañas y una sonrisa compartida frente al horizonte." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (3).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Milán", title: "Retrato en blanco y negro", desc: "Un selfie bajo el cielo abierto, sin más fondo que el aire." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (4).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Lombardía", title: "Bajo el cielo azul", desc: "Gafas de sol y luz directa: verano grabado en un instante." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (5).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Como", title: "Plaza de Como", desc: "La catedral y sus cúpulas verdes dominan la plaza lombarda." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (6).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Como", title: "Catedral de Como", desc: "Mármol claro y cúpulas de cobre en el corazón del lago." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (7).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Como", title: "Como en primavera", desc: "La ciudad respira calma entre calles peatonales y cúpulas antiguas." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (8).jpeg", aspect: "landscape", album: "Cultura", country: "Italia", place: "Como", title: "Duomo di Como", desc: "Una panorámica donde la catedral, el teatro y la montaña se encuentran." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (9).jpeg", aspect: "portrait", album: "Naturaleza", country: "España", place: "Madrid", title: "Fuente del Retiro", desc: "Agua, flores y árboles desnudos en el parque más querido de Madrid." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (10).jpeg", aspect: "landscape", album: "Cultura", country: "España", place: "Madrid", title: "Puerta de Alcalá", desc: "El gran arco de granito vigila el tráfico bajo un cielo de nubes." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (11).jpeg", aspect: "portrait", album: "Urbano", country: "España", place: "Madrid", title: "Calles de Madrid", desc: "Arquitectura clásica, bandera española y primavera en las ramas." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (12).jpeg", aspect: "landscape", album: "Cultura", country: "España", place: "Madrid", title: "Museo del Prado", desc: "Columnas, escalinata y siglos de arte reunidos en una sola fachada." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (13).jpeg", aspect: "portrait", album: "Nosotros", country: "España", place: "Madrid", title: "Primavera juntos", desc: "Hojas verdes y cielo azul enmarcando una sonrisa compartida." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (14).jpeg", aspect: "portrait", album: "Urbano", country: "España", place: "Madrid", title: "Mirador de Madrid", desc: "La ciudad se extiende bajo un puente de cristal al atardecer." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (15).jpeg", aspect: "portrait", album: "Urbano", country: "España", place: "Madrid", title: "Atardecer urbano", desc: "Desde la ventana, el sol tiñe de oro los tejados de la capital." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (16).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Lombardía", title: "Noche de cena", desc: "Espejos, luces cálidas y un brindis silencioso en buena compañía." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (17).jpeg", aspect: "portrait", album: "Detalles", country: "España", place: "Palma", title: "Ramo en Palma", desc: "Rosas, eucalipto y calles mallorquinas en un detalle florido." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (18).jpeg", aspect: "portrait", album: "Detalles", country: "España", place: "Palma", title: "Flores de primavera", desc: "Un ramo que oculta la cara y deja ver solo la alegría del momento." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (19).jpeg", aspect: "landscape", album: "Cultura", country: "Italia", place: "Pisa", title: "Piazza dei Miracoli", desc: "La torre inclinada y la catedral comparten césped y cielo toscano." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (20).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Pisa", title: "Turistas en Pisa", desc: "Selfie obligado con la torre que desafía la gravedad." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (21).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Pisa", title: "Torre inclinada", desc: "Mármol blanco y césped verde: el icono de Pisa en toda su altura." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (22).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Pisa", title: "Baptisterio de Pisa", desc: "Mármol, arcos y turistas rodean esta joya del románico italiano." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (23).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Pisa", title: "Fontana dei Putti", desc: "Ángeles de piedra custodian la plaza entre fachadas de colores." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (24).jpeg", aspect: "portrait", album: "Viajes", country: "Italia", place: "Pisa", title: "Abrazo en Pisa", desc: "De espaldas a la torre, compartiendo el silencio del atardecer." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (25).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Toscana", title: "Reflejo compartido", desc: "Un espejo de viaje captura la complicidad de dos sonrisas." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (26).jpeg", aspect: "landscape", album: "Nosotros", country: "Italia", place: "Toscana", title: "Selfie de viaje", desc: "Cuadros escoceses y persianas verdes en un rincón europeo." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (27).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Toscana", title: "Luz de mediodía", desc: "El sol marca cada sombra en este retrato de pareja viajera." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (28).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Venecia", title: "Carlo Goldoni", desc: "La estatua del dramaturgo preside la plaza veneciana." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (29).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "Puente veneciano", desc: "Canal, fachadas rosadas y una sonrisa sobre el agua quieta." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (30).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "Canal y colores", desc: "Venecia se refleja en el agua mientras ella posa en el puente." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (31).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Venecia", title: "San Marco de cerca", desc: "Mosaicos dorados y arcos bizantinos bajo un cielo sin nubes." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (32).jpeg", aspect: "landscape", album: "Cultura", country: "Italia", place: "Venecia", title: "Fachada dorada", desc: "Los caballos de bronce miran la plaza desde lo alto de la basílica." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (33).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Venecia", title: "Campanile di San Marco", desc: "El campanario de ladrillo se eleva sobre la multitud de la plaza." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (34).jpeg", aspect: "landscape", album: "Cultura", country: "Italia", place: "Venecia", title: "Mosaicos al sol", desc: "La luz tardía enciende el oro de San Marcos." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (35).jpeg", aspect: "portrait", album: "Viajes", country: "Italia", place: "Venecia", title: "Plaza San Marco", desc: "Basílica, campanile y turistas bajo la luz dorada del atardecer." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (36).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "San Marcos sonriendo", desc: "La basílica de fondo y una sonrisa que lo dice todo." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (37).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "Sobre el canal", desc: "Vestido rojo, agua verde y arquitectura que no necesita filtro." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (38).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Burano", title: "Burano de colores", desc: "Casas pintadas y canal: el postal veneciano hecho realidad." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (39).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Burano", title: "Casas del canal", desc: "Rojo vibrante contra fachadas amarillas y rosas de Burano." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (40).jpeg", aspect: "portrait", album: "Cultura", country: "Italia", place: "Venecia", title: "Colleoni a caballo", desc: "Bronce y mármol: un condottiero eterno en la plaza veneciana." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (41).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "Máscara veneciana", desc: "Plumas rojas y carnaval sobre las aguas del Gran Canal." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (42).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "Paseo en barco", desc: "El agua acaricia el casco mientras la ciudad pasa a ambos lados." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (43).jpeg", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "Aguas de Venecia", desc: "Canal, fachada terracota y un momento suspendido en el barco." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06 (44).jpeg", aspect: "portrait", album: "Nosotros", country: "Italia", place: "Venecia", title: "Reflejo en el arco", desc: "Piedra antigua enmarca a la pareja en un espejo de ventana." },
  { id: "assets/fotos/WhatsApp Image 2026-05-23 at 13.41.06.jpeg", aspect: "portrait", album: "Urbano", country: "Italia", place: "Milán", title: "Excelsior Gallia", desc: "La elegancia milanesa se asoma tras los árboles de la avenida." },
  { id: "assets/fotos/WhatsApp Video 2026-05-23 at 13.41.06.mp4", type: "video", aspect: "portrait", album: "Viajes", country: "Italia", place: "Milán", title: "Desde el tranvía", desc: "La ciudad pasa tras el cristal mientras caminamos juntos." },
  { id: "assets/fotos/WhatsApp Video 2026-05-23 at 13.41.06 (1).mp4", type: "video", aspect: "portrait", album: "Naturaleza", country: "Italia", place: "Toscana", title: "Camino juntos", desc: "Dos siluetas al fondo de un paseo infinito entre árboles." },
  { id: "assets/fotos/WhatsApp Video 2026-05-23 at 13.41.06 (2).mp4", type: "video", aspect: "portrait", album: "Nosotros", country: "España", place: "Madrid", title: "El Edén", desc: "Un espejo, un gastrobar y una sonrisa compartida al atardecer." },
  { id: "assets/fotos/WhatsApp Video 2026-05-23 at 13.41.06 (3).mp4", type: "video", aspect: "portrait", album: "Ella", country: "Italia", place: "Venecia", title: "San Marcos en vivo", desc: "El oro de la basílica brilla bajo el sol veneciano." },
];

function finalizePhoto(entry) {
  const photo = { ...entry };
  if (GALLERY_META.ratios[photo.id]) photo.ratio = GALLERY_META.ratios[photo.id];
  else if (!photo.ratio) photo.ratio = photo.aspect === 'landscape' ? 4 / 3 : 3 / 4;
  if (GALLERY_META.descs[photo.id]) photo.desc = GALLERY_META.descs[photo.id];
  if (GALLERY_META.ellaIds.has(photo.id)) photo.album = 'Ella';
  return photo;
}

export const PHOTOS = RAW_PHOTOS.map(finalizePhoto);

export const ALBUM_ORDER = ["Nosotros", "Viajes", "Cultura", "Urbano", "Naturaleza", "Detalles", "Ella"];

export function getAlbumsList() {
  const albums = [...new Set(PHOTOS.map((p) => p.album))];
  const open = [
    ...ALBUM_ORDER.filter((a) => albums.includes(a)),
    ...albums.filter((a) => !isProtectedAlbum(a) && !ALBUM_ORDER.includes(a)),
  ];
  const locked = albums.filter((a) => isProtectedAlbum(a));
  return [...open, ...locked];
}

export function getPublicPhotos() {
  return PHOTOS.filter((p) => !isProtectedAlbum(p.album));
}

export function getCountries() {
  const countries = new Set(PHOTOS.map((p) => p.country));
  return [...countries].sort();
}

export function getPlaces(country) {
  const places = new Set(
    PHOTOS.filter((p) => p.country === country).map((p) => p.place),
  );
  return [...places].sort();
}

export function getPhotosByPlace(country, place) {
  return PHOTOS.filter((p) => p.country === country && p.place === place);
}

export function getPlaceCount(country, place) {
  return PHOTOS.filter((p) => p.country === country && p.place === place).length;
}
