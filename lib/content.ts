/**
 * Todos los textos del sitio viven acá. Los componentes no llevan texto hardcodeado.
 * Placeholders: reemplazá fotos, bios y textos cuando quieras.
 */
export const content = {
  brand: {
    name: 'barberiaMilan',
    tagline: 'Barbería clásica en Villa Gdor. Gálvez',
    address: 'Av. Soldado Aguirre 1756, Villa Gdor. Gálvez',
    phone: '3416801035',
    whatsapp: '543416801035', // formato internacional para wa.me
    email: 'milanjuancruz@gmail.com',
    instagram: '@juancruzmilan5',
    instagramUrl: 'https://instagram.com/juancruzmilan5',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Soldado+Aguirre+1756+Villa+Gobernador+Galvez',
  },

  header: {
    manageShort: 'Mi turno',
    menu: 'Menú',
    theme: 'Cambiar tema',
    backToTop: 'Volver arriba',
    skip: 'Saltar al contenido',
    whatsappText: 'Hola! Quiero consultar por un turno.',
  },

  nav: [
    { id: 'servicios', label: 'Servicios' },
    { id: 'barberos', label: 'Barberos' },
    { id: 'reservar', label: 'Reservar', highlight: true },
    { id: 'preguntas', label: 'Preguntas' },
    { id: 'contacto', label: 'Contacto' },
  ],

  hero: {
    eyebrow: 'BARBERÍA CLÁSICA EN VGG',
    titleStart: 'Corte, barba y ',
    titleAccent: 'estilo a navaja',
    text: 'Reservá tu turno online en menos de un minuto y llegá directo al sillón, sin esperas.',
    primaryCta: 'Reservar turno',
    secondaryCta: 'Ver servicios',
    hours: 'Martes a sábados de 9 a 21 hs',
    imageUrl: '/placeholders/hero.svg',
  },

  walkIn: {
    eyebrow: 'IMPORTANTE',
    // {Days} se reemplaza con los días configurados en el admin
    title: '{Days}: por orden de llegada',
    // {days} se reemplaza con los días configurados en el admin
    text: 'Los {days} atendemos sin reserva, por orden de llegada. El resto de la semana, reservá tu turno acá.',
  },

  sections: {
    services: { eyebrow: 'SERVICIOS', titleStart: 'Lo que hacemos, ', titleAccent: 'bien hecho' },
    team: { eyebrow: 'EQUIPO', titleStart: 'Las manos detrás ', titleAccent: 'del corte' },
    booking: { eyebrow: 'RESERVAR', titleStart: 'Elegí tu ', titleAccent: 'turno' },
    faq: { eyebrow: 'PREGUNTAS', titleStart: 'Antes de ', titleAccent: 'reservar' },
  },

  booking: {
    reserveCta: 'Reservar',
    placeholder: 'El asistente de reserva se conecta en el próximo paso.',
    steps: ['Servicio', 'Barbero', 'Día y hora', 'Tus datos'],
    anyBarber: 'Cualquier barbero',
    paymentNote: 'El pago se realiza en el local: efectivo o transferencia.',
    slotTaken: 'Ese horario se acaba de ocupar, elegí otro.',
    unavailableLabel: 'no disponible',
    periods: ['Mañana', 'Tarde', 'Noche'],
  },

  wizard: {
    servicesTitle: 'Elegí uno o más servicios',
    barberTitle: '¿Con quién querés atenderte?',
    dateTitle: 'Elegí día y hora',
    dataTitle: 'Tus datos',
    total: 'Total',
    duration: 'Duración',
    next: ['Elegir barbero', 'Elegir día y hora', 'Tus datos'],
    confirm: 'Reservar turno',
    confirming: 'Confirmando...',
    confirmDialog: {
      title: 'Confirmá tu turno',
      text: 'Revisá que esté todo bien antes de reservar.',
      customer: 'A nombre de',
      yes: 'Sí, reservar',
      edit: 'Volver a editar',
    },
    back: 'Volver',
    noBarbers: 'Ningún barbero hace todos esos servicios juntos. Volvé y sacá alguno.',
    anyBarberHint: 'Te asignamos el primero que esté libre.',
    weekdaysShort: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    loading: 'Cargando horarios...',
    noSlots: 'No hay horarios para este día.',
    pickDay: 'Elegí un día para ver los horarios.',
    walkInNotice: 'Ese día atendemos por orden de llegada, sin reserva. Pasá por el local.',
    availError: 'No pudimos cargar los horarios. Vamos a reintentar en unos segundos.',
    slotGone: 'El horario que elegiste se acaba de ocupar, elegí otro.',
    networkError: 'No pudimos conectar. Revisá tu conexión y probá de nuevo.',
    transferInfo: 'Si preferís transferir: alias {alias}, titular {holder}.',
    fields: {
      name: 'Nombre y apellido',
      phone: 'Teléfono',
      phoneHint: 'Ej.: 341 680 1035',
      email: 'Email (opcional)',
      notes: 'Comentarios (opcional)',
      terms: 'Acepto los términos y que el pago se hace en el local.',
    },
    errors: {
      name: 'Ingresá tu nombre.',
      phone: 'Ingresá un teléfono válido (ej.: 341 680 1035).',
      email: 'El email no es válido.',
      terms: 'Tenés que aceptar los términos.',
    },
    summaryTitle: 'Tu turno',
    summaryEmpty: 'Todavía no elegiste servicios.',
    barberLabel: 'Barbero',
    whenLabel: 'Día y hora',
    done: {
      title: '¡Turno reservado!',
      codeLabel: 'Tu código',
      text: 'Guardalo: lo necesitás para consultar o cancelar tu turno.',
      calendar: 'Agregar al calendario',
      whatsapp: 'Compartir por WhatsApp',
      cancel: 'Cancelar turno',
      cancelConfirm: '¿Seguro que querés cancelar? Se libera el horario.',
      cancelYes: 'Sí, cancelar',
      cancelNo: 'No, mantener',
      cancelled: 'Turno cancelado. El horario quedó libre.',
      another: 'Reservar otro turno',
      shareText: 'Reservé turno en {name}: {when}. Código: {code}. Dirección: {address}.',
    },
  },

  manage: {
    title: 'Consultar o cancelar mi turno',
    text: 'Ingresá el código que te dimos al reservar y tu teléfono.',
    codeLabel: 'Código',
    codeHint: 'Ej.: K7M2QX',
    phoneLabel: 'Teléfono',
    search: 'Buscar turno',
    searching: 'Buscando...',
    close: 'Cerrar',
    statusLabel: 'Estado',
    statuses: {
      PENDING: 'Pendiente de confirmación',
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
      COMPLETED: 'Completado',
      NO_SHOW: 'No asististe',
    },
    cancel: 'Cancelar turno',
    cancelConfirm: '¿Seguro que querés cancelar? Se libera el horario.',
    cancelYes: 'Sí, cancelar',
    cancelNo: 'No, mantener',
    cancelled: 'Turno cancelado. El horario quedó libre.',
    tooLate: 'Ya no se puede cancelar online (falta menos de {hours} hs). Escribinos por WhatsApp.',
    whatsapp: 'Escribir por WhatsApp',
    another: 'Buscar otro turno',
  },

  faq: [
    {
      q: '¿Cómo funciona la reserva?',
      a: 'Elegís servicio, barbero, día y horario, dejás tus datos y listo. No hace falta crear una cuenta.',
    },
    {
      q: '¿Qué pasa después de reservar?',
      a: 'Te mostramos un código de 6 caracteres. Si dejaste tu email, también te lo enviamos ahí. Con ese código podés consultar o cancelar tu turno.',
    },
    {
      q: '¿Puedo cancelar o cambiar mi turno?',
      a: 'Sí, hasta 2 horas antes desde "Consultar o cancelar mi turno", con tu código y tu teléfono. Para cambiarlo, cancelá y reservá otro horario.',
    },
    {
      q: '¿Cómo se paga?',
      a: 'En el local, en efectivo o por transferencia. No pedimos seña ni pago online.',
    },
    {
      q: '¿Los precios son finales?',
      a: 'Sí, son los que ves al reservar. Si te sumás otro servicio en el momento, se abona aparte.',
    },
  ],

  footer: {
    location: 'UBICACIÓN',
    hours: 'HORARIOS',
    contact: 'CONTACTO',
    hoursLines: ['Martes a sábados: 9 a 21 hs', 'Domingo y lunes: cerrado'],
    manageBooking: 'Consultar o cancelar mi turno',
  },

  seo: {
    title: 'barberiaMilan | Reservá tu turno online',
    description:
      'Barbería en Villa Gobernador Gálvez. Reservá tu turno online con el barbero que prefieras: corte, barba y más.',
  },
} as const;

export type Content = typeof content;
