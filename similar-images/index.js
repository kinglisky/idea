(function () {
    const uploadBtn = document.querySelector('#upload-btn');
    const grayBtn = document.querySelector('#gray-btn');
    const otsuBtn = document.querySelector('#otsu-btn');
    const compareBtn = document.querySelector('#compare-btn');
    const originImg1 = document.querySelector('#origin1');
    const originImg2 = document.querySelector('#origin2');
    const grayImg1 = document.querySelector('#gray1');
    const grayImg2 = document.querySelector('#gray2');
    const otsuImg1 = document.querySelector('#otsu1');
    const otsuImg2 = document.querySelector('#otsu2');

    function updateOrignImages([url1, url2]) {
        originImg1.src = url1;
        originImg2.src = url2;
    }

    function updateGrayImages([url1, url2]) {
        grayImg1.src = url1;
        grayImg2.src = url2;
    }

    function updateOtsuImages([url1, url2]) {
        otsuImg1.src = url1;
        otsuImg2.src = url2;
    }

    function createCanvas({ width, height }) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    function calculateGray(r, g, b) {
        return parseInt(r * 0.299 + g * 0.587 + b * 0.114);
    }

    function imageToGray(canvas) {
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let x = 0; x < data.width; x++) {
            for (let y = 0; y < data.height; y++) {
                const idx = (x + y * canvas.width) * 4;
                // The RGB values
                const r = data.data[idx + 0];
                const g = data.data[idx + 1];
                const b = data.data[idx + 2];
                //更新图像数据
                const gray = calculateGray(r, g, b);
                data.data[idx + 0] = gray;
                data.data[idx + 1] = gray;
                data.data[idx + 2] = gray;
            }
        }

        ctx.putImageData(data, 0, 0);
        return { canvas, ctx };
    }

    function imageGrayOutput(image, size = 120) {
        const {
            naturalWidth,
            naturalHeight,
        } = image;
        const width = size;
        const height = size;
        const canvas = createCanvas({ width, height });
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight, 0, 0, width, height);
        return imageToGray(canvas);
    }

    function otsu(grayData) {
        let ptr = 0
        let histData = Array(256).fill(0) // 记录0-256每个灰度值的数量，初始值为0
        let total = grayData.length

        while (ptr < total) {
            let h = grayData[ptr++];
            histData[h]++
        }

        let sum = 0        // 总数(灰度值x数量)
        for (let i = 0; i < 256; i++) {
            sum += i * histData[i]
        }


        let wB = 0         // 背景（小于阈值）的数量
        let wF = 0         // 前景（大于阈值）的数量
        let sumB = 0       // 背景图像（灰度x数量）总和
        let varMax = 0     // 存储最大类间方差值
        let threshold = 0  // 阈值

        for (let t = 0; t < 256; t++) {
            wB += histData[t]       // 背景（小于阈值）的数量累加
            if (wB === 0) continue
            wF = total - wB         // 前景（大于阈值）的数量累加
            if (wF === 0) break

            sumB += t * histData[t] // 背景（灰度x数量）累加

            let mB = sumB / wB          // 背景（小于阈值）的平均灰度
            let mF = (sum - sumB) / wF  // 前景（大于阈值）的平均灰度

            let varBetween = wB * wF * (mB - mF) ** 2  // 类间方差

            if (varBetween > varMax) {
                varMax = varBetween
                threshold = t
            }
        }

        return threshold
    }

    function imageOtsuOutput(imgData, threshold) {
        const { width, height, data } = imgData;
        const canvas = createCanvas({ width, height });
        const ctx = canvas.getContext('2d');
        const hash = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const idx = (x + y * canvas.width) * 4;
                const v = data[idx + 0] > threshold ? 255 : 0;
                data[idx] = v;
                data[idx + 1] = v;
                data[idx + 2] = v;
                hash.push(v > 0 ? 1 : 0);
                // data[idx + 3] = data[idx + 3];
            }
        }
        ctx.putImageData(imgData, 0, 0);
        return { canvas, ctx, hash };
    }

    uploadBtn.addEventListener('change', (event) => {
        const files = [...event.target.files].slice(0, 2);
        const urls = files.map(file => URL.createObjectURL(file));
        updateOrignImages(urls);
    }, false);

    let gray1 = null;
    let gray2 = null;

    grayBtn.addEventListener('click', () => {
        gray1 = imageGrayOutput(originImg1);
        gray2 = imageGrayOutput(originImg2);

        updateGrayImages([
            gray1.canvas.toDataURL(),
            gray2.canvas.toDataURL(),
        ]);

    }, false);

    let otsu1 = null;
    let otsu2 = null;

    otsuBtn.addEventListener('click', () => {
        const imgData1 = gray1.ctx.getImageData(0, 0, gray1.canvas.width, gray1.canvas.height);
        const imgData2 = gray2.ctx.getImageData(0, 0, gray1.canvas.width, gray1.canvas.height);
        
        const threshold1 = otsu(imgData1.data);
        const threshold2 = otsu(imgData2.data);

        console.log('图片 1 阈值', threshold1);
        console.log('图片 2 阈值', threshold2);

        otsu1 = imageOtsuOutput(imgData1, threshold1);
        otsu2 = imageOtsuOutput(imgData2, threshold2);

        updateOtsuImages([
            otsu1.canvas.toDataURL(),
            otsu2.canvas.toDataURL(),
        ]);
    }, false);

    compareBtn.addEventListener('click', () => {
        const { hash: hash1 }  = otsu1;
        const { hash: hash2 }  = otsu2;
        console.log('图片 1 hash 值', hash1);
        console.log('图片 2 hahs 值', hash2);

        let diff = 0;
        const total = hash2.length;
        hash2.forEach((v, i) => {
            diff += v === hash1[i] ? 0 : 1;
        });
        console.log({ diff, total });
        const percent = (1- diff / total) * 100;

        alert(`图片相识度为：${percent}%`);
    }, false);
})()