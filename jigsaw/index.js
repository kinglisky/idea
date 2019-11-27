const axios = require('axios')
const sharp = require('sharp')
const shell = require('shelljs')
const path = require('path')

const CHUNK_WIDTH = 600
const CHUNK_HEIGHT = 400
const CHUNK_PADDING = CHUNK_HEIGHT / 8
const CHUNK_SIZE = 1
const IMG_COUNT = 20
const IMG_MAP = {}
const RANDOM_IMG_API = 'https://img.xjh.me/random_img.php?type=bg&ctype=nature&return=json'

function resolve (dir) {
  return path.join(__dirname, dir)
}

async function fetchImg () {
  const { img } = await axios.get(RANDOM_IMG_API).then(res => res.data)
  if (IMG_MAP[img]) {
    return fetchImg()
  }
  IMG_MAP[img] = true
  return axios.get(`https:${img}`, { responseType: 'arraybuffer' }).then(res => res.data)
}

/**
 * @description 创建指定宽高的透明底图
 */
async function createBaseImg (options) {
  const { width, height, alpha = 0, r = 0, g = 0, b = 0 } = options
  const conf = {
    width,
    height,
    channels: 4,
    background: { r, g, b, alpha }
  }
  return sharp({ create: conf }).png().toBuffer()
}

async function createChunkBuffer () {
  const buffer = await fetchImg()
  const baseSharp = sharp(buffer)
  const meta = await baseSharp.metadata()
  const adaptHeight = CHUNK_HEIGHT - CHUNK_PADDING * 2
  const adaptWidth = (meta.width * adaptHeight / meta.height) | 0
  const overFlowOffset = (adaptWidth - CHUNK_WIDTH) / 2 | 0
  const currImg = await baseSharp
    .resize(adaptWidth, adaptHeight)
    .extract({
      top: 0,
      left: overFlowOffset > 0 ? overFlowOffset : 0,
      width: overFlowOffset > 0 ? CHUNK_WIDTH : adaptWidth,
      height: adaptHeight
    })
    .toBuffer()
  const baseImg = await createBaseImg({
    width: CHUNK_WIDTH,
    height: CHUNK_HEIGHT,
    alpha: 1
  })
  const offsetOpt = {
    top: CHUNK_PADDING,
    left: overFlowOffset >= 0 ? 0 : -overFlowOffset
  }
  const mixImg = await sharp(baseImg).overlayWith(currImg, offsetOpt).toBuffer()
  return sharp(mixImg).resize(CHUNK_WIDTH, CHUNK_HEIGHT).toBuffer()
}

async function run () {
  const baseOptions = {
    width: CHUNK_WIDTH * CHUNK_SIZE,
    height: CHUNK_HEIGHT * Math.ceil(IMG_COUNT / CHUNK_SIZE)
  }
  let baseBuffer = await createBaseImg(baseOptions)
  for (let i = 0; i < IMG_COUNT; i++) {
    const offsetOpt = {
      top: (i / CHUNK_SIZE | 0) * CHUNK_HEIGHT,
      left: (i % CHUNK_SIZE) * CHUNK_WIDTH
    }
    const chunkBuffer = await createChunkBuffer()
    baseBuffer = await sharp(baseBuffer).overlayWith(chunkBuffer, offsetOpt).png().toBuffer()
    console.log(`正在拼接第 ${i + 1} 张图`)
  }
  const fileName = resolve(`${Date.now()}.png`)
  await sharp(baseBuffer).toFile(fileName)
  shell.exec(`open ${fileName}`)
}

run()
