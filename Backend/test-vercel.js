const handler = require('./api/index.js');

const req = { method: 'GET', url: '/' };
const res = {
    status: function(s) { 
        console.log('Status:', s); 
        return this; 
    },
    json: function(data) { 
        console.log('JSON Output:', data); 
        return this;
    },
    send: function(data) {
        console.log('Send Output:', data);
        return this;
    }
};

console.log("Starting invocation...");
handler(req, res).then(() => {
    console.log("Invocation complete.");
    process.exit(0);
}).catch(err => {
    console.error("Invocation error:", err);
    process.exit(1);
});
