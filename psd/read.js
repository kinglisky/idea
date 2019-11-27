const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const { resolve } = require('./utils')

const output = resolve('ls.md')

async function run () {
  const buffer = await readFile(resolve('temp.psd'))
  console.log('utf-8', buffer.isEncoding('utf8'))
  await writeFile(output, buffer.toString('hex'))
}

run()
