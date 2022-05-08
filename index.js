const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//JWT implementation
function verifyJWT(req, res, next){
     const authHeader = req.headers.authorization;
     if(!authHeader){
         return res.status(401).send({message: 'unauthorized access'});
     }
     const token = authHeader.split(' ')[1];
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
         if(err){
             return res.status(403).send({message: 'Forbidden Access'});
         }
         req.decoded = decoded;
     })
     next();
}

//Connect with mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rm3yw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try{
        await client.connect();
        const autosCollection = client.db('raiyanAuto').collection('autos');
        
        //AUTH
        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({accessToken});
        });

        //get all autos API
        app.get('/auto', async (req, res) => {
            const query = {};
            const cursor = autosCollection.find(query);
            const autos = await cursor.toArray();
            res.send(autos);
        })

         //get autos by user API
         app.get('/newauto', verifyJWT, async(req, res) => {
            const decodedEmail = req.decoded.email;
             const email = req.query.email;
             if(email === decodedEmail) {
                const query = {email: email};
                const cursor = autosCollection.find(query);
                const autos = await cursor.toArray();
                res.send(autos);
             }
             else{
                 return res.status(403).send({message: 'Forbidden Access'});
             }
         });

        //get specific auto API
        app.get('/auto/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const auto = await autosCollection.findOne(query);
            res.send(auto);
        });

        //Add new item API
        app.post('/auto', async (req, res) => {
            const newItem = req.body;
            const result = await autosCollection.insertOne(newItem);
            res.send(result);
        });

        //Update item API
        app.put('/auto/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $inc: {
                    quantity: updatedItem.quantity,
                }
            };
            const result = await autosCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

         //Delete API
         app.delete('/auto/:id', async (req, res) => {
             const id = req.params.id;
             const query = {
                 _id: ObjectId(id)
             };
             const result = await autosCollection.deleteOne(query);
             res.send(result)
         });
    }
    finally{

    }
}

run().catch(console.dir);







//Root API
app.get('/', (req, res) => {
    res.send('Server is running')
})

//Dynamic route
app.listen(port, () => {
    console.log(`Listening to port ${port}`)
});