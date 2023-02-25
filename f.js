//create public key and encode it with spki using crypto
var crypto = require('crypto');
var fs = require('fs');
var key = crypto.generateKeyPairSync('rsa', {
	modulusLength: 2048,
});
const publicKey = key.publicKey.export({
	type: 'spki',
	format: 'der',
});
const privateKey = key.privateKey.export({
	type: 'pkcs1',
	format: 'der',
});

//fs.writeFileSync('public.pem', publicKey.toString('base64'));
//fs.writeFileSync("private.pem", key.privateKey);

//console.log(dec);
