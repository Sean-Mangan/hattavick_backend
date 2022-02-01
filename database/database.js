var MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${username}:${password}@serverlessinstance0.tfusg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
module.exports = {
    "client" : client,
    "username" : username,
    "password" : password,
    "uri" : uri
};