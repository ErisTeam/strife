//create public key and encode it with spki using crypto
var crypto = require("crypto");
var fs = require("fs");
var key = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const publicKey = key.publicKey.export({
  type: "spki",
  format: "der",
});
const privateKey = key.privateKey.export({
  type: "pkcs1",
  format: "der",
});

let a = Buffer.from(
  "lSXG7hIWF7mJYKzAy1WGIrLSJtSN8qvUfTNS6SEsEuEDkv1IVoyt+84beNd2jNQglbLoSZ0ftGzqyDwC8prgM6kbyaz4mbKOFvhpPgCJu5ADx5h7WIN3NPd727YX0CgkLCU5Or++nSUx+89jwNpKj5e8V/WZJuaVwfw7HpfVvudgOI7ajDo3h9k3TizHZtT37n54Ofj1LxdflanOVR06C89OjJ5DP5kg+dVH49usE8Bu9gjl6o253Sfn0hwspA==",
  "base64"
);
let b = crypto.createHash("sha256").update(a).digest("base64url");
console.log(b);
fs.writeFileSync("public.pem", publicKey.toString("base64"));
//fs.writeFileSync("private.pem", key.privateKey);
