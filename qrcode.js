const qrcode = require('qrcode-terminal');

const main = () => {
    qrcode.generate('https://google.com');
}

main();