const fs = require('fs');
const {
    writePsdBuffer
} = require('ag-psd');
require('ag-psd/initialize-canvas');

const psd = {
    width: 300,
    height: 200,
    children: [{
        name: 'Layer #1',
    }]
};

const buffer = writePsdBuffer(psd);
fs.writeFileSync('my-file.psd', buffer);