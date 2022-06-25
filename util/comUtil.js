const log = console.log;

function postSend(url, data) {
    let request = require("request");
    request.post({
        headers: {'content-type': 'application/json'},
        url: url,
        body: data,
        json: true,
        function(err, res, body) {
            log(body);
        }
    });
}

module.exports.postSend = postSend;