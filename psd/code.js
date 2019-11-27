const fs = require('fs')
const detectCharacterEncoding = require('detect-character-encoding')

const fileBuffer = fs.readFileSync('ls.psd')
const charsetMatch = detectCharacterEncoding(fileBuffer)

console.log(charsetMatch)
