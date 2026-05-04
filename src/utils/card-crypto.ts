/**
 * Cifrado simétrico para datos de tarjeta usando WebCrypto (AES-GCM).
 *
 * Modelo de seguridad:
 *  - Clave derivada con PBKDF2 desde `userId + saltAleatorio` (250k iteraciones).
 *  - El salt se guarda junto al cifrado (no es secreto, solo aleatoriedad).
 *  - El nonce/IV es aleatorio por cifrado.
 *  - Output formato: `salt_b64.iv_b64.ciphertext_b64` para portabilidad.
 *
 * IMPORTANTE — limitaciones:
 *  - La clave depende del `userId`. Si el usuario es el atacante (o tiene
 *    acceso al token de Firebase) puede descifrar igual. La protección real
 *    es contra leaks de Firestore o backups (tienen el cifrado, no el userId
 *    directo en el mismo lugar).
 *  - Para una protección stronger se debería pedir un passphrase al usuario
 *    y derivar la clave de ese, pero rompe la UX (preguntar cada vez).
 *  - CVC NUNCA se cifra ni se persiste. El usuario lo guarda en su gestor
 *    de contraseñas o lo recuerda.
 */

const PBKDF2_ITERATIONS = 250_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;
const IV_BYTES = 12; // 96 bits, recomendado para AES-GCM

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function deriveKey(userId: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(userId) as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Cifra un string (típicamente un número de tarjeta). Devuelve un blob
 * `salt.iv.ciphertext` en base64 listo para guardar en Firestore.
 */
export async function encryptCardField(
  plaintext: string,
  userId: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(userId, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext) as BufferSource,
  );
  return `${bufToB64(salt)}.${bufToB64(iv)}.${bufToB64(ciphertext)}`;
}

/**
 * Descifra un blob producido por `encryptCardField`. Lanza Error si el
 * formato es inválido o la clave no coincide.
 */
export async function decryptCardField(
  encrypted: string,
  userId: string,
): Promise<string> {
  const parts = encrypted.split('.');
  if (parts.length !== 3) {
    throw new Error('Formato cifrado inválido');
  }
  const [saltB64, ivB64, ctB64] = parts;
  const salt = b64ToBuf(saltB64);
  const iv = b64ToBuf(ivB64);
  const ciphertext = b64ToBuf(ctB64);
  const key = await deriveKey(userId, salt);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource,
  );
  return new TextDecoder().decode(plain);
}

/**
 * Quita espacios y guiones de un número de tarjeta. No valida luhn ni longitud.
 */
export function normalizeCardNumber(input: string): string {
  return input.replace(/[\s-]/g, '');
}

/**
 * Formatea "•••• •••• •••• 4321" para mostrar enmascarado.
 */
export function maskCardNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

/**
 * Inferir la marca a partir del primer dígito (BIN simplificado).
 */
export function detectCardBrand(
  number: string,
): 'visa' | 'mastercard' | 'amex' | 'other' {
  const n = normalizeCardNumber(number);
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'other';
}

/**
 * Validación mínima de fecha de vencimiento. No usa Luhn ni nada complejo
 * — solo verifica que la tarjeta no esté vencida.
 */
export function isCardExpired(expMonth: number, expYear: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (expYear < currentYear) return true;
  if (expYear === currentYear && expMonth < currentMonth) return true;
  return false;
}
