/** Human-readable order/booking reference, e.g. "FR-7K2Q9M". */
export function reference(prefix: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1
  let out = ''
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  for (const byte of bytes) out += alphabet[byte % alphabet.length]
  return `${prefix}-${out}`
}
