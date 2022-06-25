function readJsonFile(fileName) {
    const fs = require('fs');
    const jsonFile = fs.readFileSync(fileName, 'utf8');
    const jsonData = JSON.parse(jsonFile);
    return jsonData;    
}

function writeJsonFile(fileName, data) {
    const fs = require('fs');
    fs.writeFileSync(fileName, JSON.stringify(data));
}

module.exports.readJsonFile = readJsonFile;
module.exports.writeJsonFile = writeJsonFile;
