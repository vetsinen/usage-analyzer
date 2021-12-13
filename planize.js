const fs = require("fs");

function planize(fileurl) {
    return fs.readFileSync(fileurl, 'utf-8');
}

//console.log(typeof planize('./usage-example.js'))

module.exports = planize