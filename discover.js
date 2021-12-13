const browseDir = require("browse-directory");
const planize = require('./planize');
const {getIdsFromText} = require('./core')
const fs = require('fs');

const rootDir = '/home/jsdev/care-flow-backend'
const dirFiles = browseDir.browseFiles(rootDir);// Get all files of folder "directory"

let msgids = []
for (file of dirFiles){
    if (file.src.endsWith('.js')){
        let rez = (getIdsFromText(planize(file.src)))
        if (rez.length>0){msgids = msgids.concat(rez)}
    }
}
console.log(JSON.stringify(msgids))
fs.writeFile("./messageids.txt", JSON.stringify(msgids), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});