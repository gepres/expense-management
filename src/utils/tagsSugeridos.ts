/**
 * Tags sugeridos por subcategoría
 *
 * Proporciona sugerencias contextuales para el campo de descripción
 * basadas en la subcategoría seleccionada
 */

export interface TagsSugeridos {
  [subcategoria: string]: string[];
}

/**
 * Mapa de tags sugeridos por subcategoría
 *
 * IMPORTANTE: Las claves deben coincidir EXACTAMENTE con las subcategorías
 * definidas en src/types/index.ts (respetando mayúsculas y tildes)
 */
export const TAGS_POR_SUBCATEGORIA: TagsSugeridos = {
  // ============================================================================
  // ALIMENTACIÓN (alimentacion)
  // Subcategorías: Bodega, Market, Pollería, Cena, Menú, Panadería, Otros
  // ============================================================================

  'Bodega': [
    'Gaseosa',
    'Galletas',
    'Agua',
    'Verduras',
    'Frutas',
    'Leche',
    'Huevos',
    'Fideos',
  ],

  'Market': [
    'Abarrotes',
    'Frutas y verduras',
    'Carnes',
    'Lácteos',
    'Limpieza',
    'Bebidas',
    'Panadería',
    'Snacks',
  ],

  'Pollería': [
    '1/8 de pollo',
    '1/4 de pollo',
    '1/2 pollo',
    'Pollo entero',
    'Pollo a la brasa',
    'Pollo broaster',
    'Caldo de gallina',
    'Papas fritas',
    'Ensalada',
  ],

  'Cena': [
    'Cena en restaurante',
    'Cena rápida',
    'A la carta',
    'Menú ejecutivo',
    'Pizza',
    'Hamburguesa',
    'Chifa',
    'Comida criolla',
  ],

  'Menú': [
    'Menú del día',
    'Menú ejecutivo',
    'Almuerzo',
    'Entrada + Segundo + Postre',
    'Bebida incluida',
    'Menú económico',
  ],

  'Panadería': [
    'Pan francés',
    'Pan integral',
    'Pan ciabatta',
    'Croissant',
    'Bizcocho',
    'Torta',
    'Empanadas',
    'Pasteles',
  ],

  // ============================================================================
  // TRANSPORTE (transporte)
  // Subcategorías: Taxi, Micro, Metro, Bus, Didi, Uber, Otros
  // ============================================================================

  'Taxi': [
    'Taxi por app',
    'Taxi en calle',
    'Carrera corta',
    'Carrera larga',
    'Propina',
    'Peaje incluido',
  ],

  'Micro': [
    'Pasaje ida',
    'Pasaje vuelta',
    'Combi',
    'Cúster',
    'Transporte interprovincial',
  ],

  'Metro': [
    'Línea 1',
    'Línea 2',
    'Tarjeta recargable',
    'Pasaje ida',
    'Pasaje vuelta',
  ],

  'Bus': [
    'Metropolitano',
    'Corredor',
    'Bus urbano',
    'Bus interprovincial',
    'Pasaje',
  ],

  'Didi': [
    'DiDi Express',
    'DiDi Max',
    'Viaje corto',
    'Viaje largo',
    'Propina',
  ],

  'Uber': [
    'UberX',
    'Uber Comfort',
    'Uber Flash',
    'Viaje al trabajo',
    'Viaje a casa',
    'Propina',
  ],

  // ============================================================================
  // ENTRETENIMIENTO (entretenimiento)
  // Subcategorías: Cine, Concierto, Bar, Trekking, Streaming, Otros
  // ============================================================================

  'Cine': [
    'Entrada 2D',
    'Entrada 3D',
    'Entrada 4D',
    'Combo cine',
    'Palomitas',
    'Bebida',
  ],

  'Concierto': [
    'Entrada general',
    'Entrada VIP',
    'Entrada preferencial',
    'Concierto local',
    'Concierto internacional',
    'Festival',
  ],

  'Bar': [
    'Cerveza',
    'Cóctel',
    'Trago',
    'Piqueo',
    'Cover',
    'Propina',
  ],

  'Trekking': [
    'Tour guiado',
    'Entrada a parque',
    'Alquiler equipo',
    'Transporte',
    'Alimentación',
    'Hospedaje',
  ],

  'Streaming': [
    'Netflix',
    'Spotify',
    'Disney+',
    'Amazon Prime',
    'HBO Max',
    'YouTube Premium',
    'Apple TV+',
  ],

  // ============================================================================
  // SALUD (salud)
  // Subcategorías: Farmacia, Consulta, Exámenes, Otros
  // ============================================================================

  'Farmacia': [
    'Medicamentos',
    'Antibióticos',
    'Analgésicos',
    'Vitaminas',
    'Antiinflamatorios',
    'Jarabe',
    'Crema',
    'Productos de higiene',
  ],

  'Consulta': [
    'Consulta general',
    'Especialista',
    'Pediatría',
    'Ginecología',
    'Dermatología',
    'Odontología',
    'Psicología',
  ],

  'Exámenes': [
    'Análisis de sangre',
    'Rayos X',
    'Ecografía',
    'Tomografía',
    'Resonancia',
    'Examen de orina',
    'Examen completo',
  ],

  // ============================================================================
  // SERVICIOS (servicios)
  // Subcategorías: Luz, Agua, Internet, Teléfono, Gas, Otros
  // ============================================================================

  'Luz': [
    'Recibo mensual',
    'Consumo de luz',
    'Medidor prepago',
    'Cargo fijo',
    'Alumbrado público',
  ],

  'Agua': [
    'Recibo mensual',
    'Consumo de agua',
    'Alcantarillado',
    'Cargo fijo',
  ],

  'Internet': [
    'Plan mensual',
    'Fibra óptica',
    'Cable',
    'TV por cable',
    'Plan dúo',
    'Plan trío',
    'Instalación',
  ],

  'Teléfono': [
    'Plan móvil',
    'Recarga',
    'Plan postpago',
    'Plan prepago',
    'Datos móviles',
    'Roaming',
  ],

  'Gas': [
    'Balón de gas',
    'Gas natural',
    'Recibo mensual',
    'Delivery de balón',
  ],

  // ============================================================================
  // COMPRAS (compras)
  // Subcategorías: Ropa, Electrónica, Muebles, Otros
  // ============================================================================

  'Ropa': [
    'Camisa',
    'Pantalón',
    'Vestido',
    'Zapatos',
    'Zapatillas',
    'Ropa interior',
    'Accesorios',
    'Chompas',
  ],

  'Electrónica': [
    'Celular',
    'Laptop',
    'Tablet',
    'Audífonos',
    'Mouse',
    'Teclado',
    'Monitor',
    'Cargador',
  ],

  'Muebles': [
    'Silla',
    'Mesa',
    'Sofá',
    'Cama',
    'Escritorio',
    'Estante',
    'Decoración',
    'Lámpara',
  ],

  // ============================================================================
  // EDUCACIÓN (educacion)
  // Subcategorías: Libros, Cursos, Material, Otros
  // ============================================================================

  'Libros': [
    'Libro de texto',
    'Novela',
    'Manual',
    'Diccionario',
    'E-book',
    'Libro técnico',
    'Revista académica',
  ],

  'Cursos': [
    'Curso online',
    'Taller presencial',
    'Certificación',
    'Diplomado',
    'Maestría',
    'Seminario',
    'Webinar',
  ],

  'Material': [
    'Cuadernos',
    'Lapiceros',
    'Lápices',
    'Mochila',
    'Folder',
    'Borrador',
    'Regla',
    'USB',
  ],

  // ============================================================================
  // VIVIENDA (vivienda)
  // Subcategorías: Alquiler, Mantenimiento, Limpieza, Otros
  // ============================================================================

  'Alquiler': [
    'Alquiler mensual',
    'Renta',
    'Adelanto',
    'Garantía',
    'Depósito',
    'Comisión',
  ],

  'Mantenimiento': [
    'Reparación',
    'Pintura',
    'Electricista',
    'Plomero',
    'Gasfitero',
    'Carpintero',
    'Materiales',
  ],

  'Limpieza': [
    'Servicio de limpieza',
    'Productos de limpieza',
    'Detergente',
    'Desinfectante',
    'Escoba',
    'Trapeador',
  ],

  // ============================================================================
  // OTROS (otros)
  // Subcategorías: Varios
  // ============================================================================

  'Varios': [
    'Impuestos',
    'Multas',
    'Donaciones',
    'Membresías',
    'Trámites legales',
    'Comisiones bancarias',
    'Varios',
    'Misceláneos',
  ],

  // ============================================================================
  // CATEGORÍA "OTROS" - TAGS ADICIONALES PARA LAS SUBCATEGORÍAS
  // ============================================================================

  'Otros': [
    'Varios',
    'Misceláneos',
    'Otros gastos',
    'Imprevistos',
    'Emergencias',
    'No clasificado',
  ],
};

/**
 * Obtener tags sugeridos para una subcategoría
 *
 * @param subcategoria - ID de la subcategoría
 * @returns Array de tags sugeridos (máximo 10)
 */
export function obtenerTagsSugeridos(subcategoria: string | undefined): string[] {
  if (!subcategoria) return [];

  const tags = TAGS_POR_SUBCATEGORIA[subcategoria];
  if (!tags) return [];

  // Limitar a máximo 10 tags
  return tags.slice(0, 10);
}

/**
 * Verificar si una subcategoría tiene tags sugeridos
 */
export function tieneTagsSugeridos(subcategoria: string | undefined): boolean {
  if (!subcategoria) return false;
  return !!TAGS_POR_SUBCATEGORIA[subcategoria];
}
