var username = process.env.MONGO_USER;
var password = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@serverlessinstance0.tfusg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
module.exports = {
    "client" : client,
    "username" : username,
    "password" : password,
    "uri" : uri
};