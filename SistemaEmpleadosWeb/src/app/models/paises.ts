// filepath: SistemaEmpleadosWeb/src/app/models/paises.ts
// Lista de países con su código de marcación internacional (ITU E.164).
// Para añadir o quitar países basta editar este archivo. Incluye sinónimos
// de búsqueda para que el filtro encuentre términos comunes en español.

export interface Pais {
  /** ISO 3166-1 alfa-2. Útil como clave estable. */
  code: string;
  /** Nombre del país en español. */
  name: string;
  /** Bandera emoji (🇦🇷, 🇺🇸, etc.) para mostrar en el select. */
  flag: string;
  /** Código de marcación internacional SIN el '+', ej: '54' para Argentina. */
  dialCode: string;
  /**
   * Términos extra que el usuario podría tipear y querés que matcheen.
   * Ej: para República Dominicana aceptamos 'rep dom', 'dominicana', 'rd'.
   * Sin tildes, todo en minúsculas.
   */
  searchTerms?: string[];
}

/**
 * Lista curada de los países más comunes en América + algunos globalmente
 * relevantes. Si necesitás TODOS los códigos ITU (~230), exportá de
 * https://github.com/madewithlove/world-countries/blob/master/src/data/countries.json
 * en su lugar.
 */
export const PAISES: Pais[] = [
  { code: 'AR', name: 'Argentina',         flag: '🇦🇷', dialCode: '54',  searchTerms: ['argentina'] },
  { code: 'BO', name: 'Bolivia',           flag: '🇧🇴', dialCode: '591', searchTerms: ['bolivia'] },
  { code: 'BR', name: 'Brasil',            flag: '🇧🇷', dialCode: '55',  searchTerms: ['bra', 'brazil'] },
  { code: 'CL', name: 'Chile',             flag: '🇨🇱', dialCode: '56',  searchTerms: ['chile'] },
  { code: 'CO', name: 'Colombia',          flag: '🇨🇴', dialCode: '57',  searchTerms: ['colombia'] },
  { code: 'CR', name: 'Costa Rica',        flag: '🇨🇷', dialCode: '506', searchTerms: ['costa rica'] },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴', dialCode: '1', searchTerms: ['republica dominicana', 'dominicana', 'rd', 'dominican'] },
  { code: 'EC', name: 'Ecuador',           flag: '🇪🇨', dialCode: '593', searchTerms: ['ecua'] },
  { code: 'SV', name: 'El Salvador',       flag: '🇸🇻', dialCode: '503', searchTerms: ['salvador'] },
  { code: 'GT', name: 'Guatemala',         flag: '🇬🇹', dialCode: '502', searchTerms: ['guatemala'] },
  { code: 'HN', name: 'Honduras',          flag: '🇭🇳', dialCode: '504', searchTerms: ['honduras'] },
  { code: 'MX', name: 'México',            flag: '🇲🇽', dialCode: '52',  searchTerms: ['mex'] },
  { code: 'NI', name: 'Nicaragua',         flag: '🇳🇮', dialCode: '505', searchTerms: ['nicaragua'] },
  { code: 'PA', name: 'Panamá',            flag: '🇵🇦', dialCode: '507', searchTerms: ['panama'] },
  { code: 'PY', name: 'Paraguay',          flag: '🇵🇾', dialCode: '595', searchTerms: ['paraguay'] },
  { code: 'PE', name: 'Perú',              flag: '🇵🇪', dialCode: '51',  searchTerms: ['peru'] },
  { code: 'PR', name: 'Puerto Rico',       flag: '🇵🇷', dialCode: '1',   searchTerms: ['pr', 'puerto rico'] },
  { code: 'ES', name: 'España',            flag: '🇪🇸', dialCode: '34',  searchTerms: ['spain', 'esp'] },
  { code: 'US', name: 'Estados Unidos',    flag: '🇺🇸', dialCode: '1',   searchTerms: ['eeuu', 'usa', 'united states'] },
  { code: 'UY', name: 'Uruguay',           flag: '🇺🇾', dialCode: '598', searchTerms: ['uru'] },
  { code: 'VE', name: 'Venezuela',         flag: '🇻🇪', dialCode: '58',  searchTerms: ['vene', 'ven'] }
];

/**
 * Normaliza un número a E.164 (+código+número, sólo dígitos después del +).
 * Si ya viene con +, respeta lo que haya.
 */
export function aE164(dialCode: string, numeroLocal: string): string {
  // Si el usuario pegó completo (con +), conservar
  if (numeroLocal.startsWith('+')) return '+' + numeroLocal.slice(1).replace(/\D/g, '');
  const local = numeroLocal.replace(/\D/g, '');
  const code = dialCode.replace(/\D/g, '');
  return '+' + code + local;
}

/**
 * Separa un teléfono E.164 en {dialCode, numeroLocal}. Si no detecta un
 * código conocido, devuelve el string completo como numeroLocal y dialCode
 * por defecto (54 = Argentina).
 */
export function fromE164(telefono: string | null | undefined, codigoPorDefecto = '54'): {
  dialCode: string;
  numeroLocal: string;
} {
  if (!telefono) return { dialCode: codigoPorDefecto, numeroLocal: '' };

  const match = telefono.match(/^\+?(\d+)/);
  if (!match) return { dialCode: codigoPorDefecto, numeroLocal: telefono };

  const digits = match[1];
  // Probar códigos de mayor a menor para preferir el match más largo.
  const codigos = Array.from(new Set(PAISES.map(p => p.dialCode)))
    .sort((a, b) => b.length - a.length);

  for (const c of codigos) {
    if (digits.startsWith(c) && digits.length > c.length) {
      return {
        dialCode: c,
        numeroLocal: digits.slice(c.length)
      };
    }
  }
  return { dialCode: codigoPorDefecto, numeroLocal: digits };
}
