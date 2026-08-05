// Metaphone phonetic encoding algorithm
export function metaphone(word) {
  word = word.toUpperCase().replace(/[^A-Z]/g, '')
  if (!word) return ''

  // Drop initial silent letters
  if (/^(KN|GN|PN|AE|WR)/.test(word)) word = word.substring(1)

  let code = ''
  let i = 0
  const len = word.length

  const charAt = (n) => (n >= 0 && n < len) ? word[n] : ''
  const isVowel = (c) => 'AEIOU'.includes(c)

  while (i < len && code.length < 6) {
    const c = word[i]
    // Skip duplicate adjacent letters (except C)
    if (c === charAt(i - 1) && c !== 'C') { i++; continue }

    switch (c) {
      case 'A': case 'E': case 'I': case 'O': case 'U':
        if (i === 0) code += c
        break
      case 'B':
        if (charAt(i - 1) !== 'M') code += 'B'
        break
      case 'C':
        if ('EIY'.includes(charAt(i + 1))) {
          code += charAt(i + 1) === 'I' && charAt(i + 2) === 'A' ? 'X' : 'S'
        } else {
          code += 'K'
        }
        break
      case 'D':
        code += ('GEI'.includes(charAt(i + 1)) && 'EIY'.includes(charAt(i + 2))) ? 'J' : 'T'
        break
      case 'F': code += 'F'; break
      case 'G':
        if (charAt(i + 1) === 'H' && !'AEIOU'.includes(charAt(i + 2))) { i++; break }
        if (i > 0 && (charAt(i + 1) === 'N' || (charAt(i + 1) === 'N' && charAt(i + 2) === 'E' && charAt(i + 3) === 'D'))) break
        if ('EIY'.includes(charAt(i + 1))) { code += 'J' } else { code += 'K' }
        break
      case 'H':
        if (isVowel(charAt(i + 1)) && !'CSPTG'.includes(charAt(i - 1))) code += 'H'
        break
      case 'J': code += 'J'; break
      case 'K':
        if (i === 0 || charAt(i - 1) !== 'C') code += 'K'
        break
      case 'L': code += 'L'; break
      case 'M': code += 'M'; break
      case 'N': code += 'N'; break
      case 'P':
        code += charAt(i + 1) === 'H' ? 'F' : 'P'
        break
      case 'Q': code += 'K'; break
      case 'R': code += 'R'; break
      case 'S':
        if (charAt(i + 1) === 'H' || (charAt(i + 1) === 'I' && 'AO'.includes(charAt(i + 2)))) {
          code += 'X'
        } else {
          code += 'S'
        }
        break
      case 'T':
        if (charAt(i + 1) === 'H') { code += '0'; break }
        if (charAt(i + 1) === 'I' && 'AO'.includes(charAt(i + 2))) { code += 'X'; break }
        code += 'T'
        break
      case 'V': code += 'F'; break
      case 'W': case 'Y':
        if (isVowel(charAt(i + 1))) code += c
        break
      case 'X': code += 'KS'; break
      case 'Z': code += 'S'; break
    }
    i++
  }
  return code
}

export const PHONETIC_SYMBOLS = [
  'ɨ','ɐɪ','æ',null,'p','m','j','s',
  'ɑ','ɔɪ','ɪ',null,'b','n','h','z',
  'u','ɑʊ','ʊ',null,'t','ɳ','f','ʃ',
  'ɔ','əʊ','ʊ',null,'d','w','v','ʒ',
  'ɜ','ɛə','ɛ',null,'c/k','ǀ','θ','tʃ',
  'ɑɪ','ɪə','ʌ','ə','g','r','ð','dʒ',
]
