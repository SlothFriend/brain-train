/**
 * Takes a positive, single-digit number and returns the half-byte (nibble) representation
 * as a boolean array. Pads with zeros in the front to ensure 4 bits are represented.
 */
export const digitToHalfByte = (n: number): boolean[] => {
  let str = (n >>> 0).toString(2)
  if (str.length >= 4) str = str.substr(-4)
  else {
    while (str.length < 4) {
      str = '0' + str
    }
  }

  return str.split('').map(s => s === '1')
}
