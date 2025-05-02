/**
 * Elimina ceros a la izquierda de una cadena numérica.
 * Ejemplo: "000123" -> "123"; si el resultado es cadena vacía, devuelve "0".
 */
export function removeLeadingZeros(value: string): string {
    const trimmed = value.replace(/^0+(?=\d)/, '');
    return trimmed === '' ? '0' : trimmed;
  }
  
  /**
   * Convierte un valor (string o number) a number.
   * - Si es string, elimina ceros a la izquierda y parsea.
   * - Si es number, devuelve el mismo.
   * - Si el parseo falla, lanza un error.
   */
  export function parseQuantity(input: string | number): number {
    if (typeof input === 'number') return input;
    const clean = removeLeadingZeros(input.trim());
    const parsed = Number(clean);
    if (Number.isNaN(parsed)) {
      throw new Error(`Valor no numérico: ${input}`);
    }
    return parsed;
  }
  
  /**
   * Formatea un número a string con separador de miles.
   * Ejemplo: 1234567 -> "1,234,567".
   */
  export function formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
  
  /**
   * Validación sencilla de un código de material.
   * Solo admite alfanuméricos y longitud mínima de 1.
   */
  export function isValidMaterialCode(code: string): boolean {
    return /^[A-Za-z0-9]+$/.test(code);
  }
  