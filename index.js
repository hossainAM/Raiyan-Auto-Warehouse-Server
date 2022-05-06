const express = require('express');
const cors = require('cors');
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
        
        //get all autos API
        app.get('/auto', async (req, res) => {
            const query = {};
            const cursor = autosCollection.find(query);
            const autos = await cursor.toArray();
            res.send(autos);
        });

        //get specific auto API
        app.get('/auto/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const auto = await autosCollection.findOne(query);
            res.send(auto);
        });

        //Delete API
        app.delete('/auto/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await autosCollection.deleteOne(query);
            res.send(result)
        });

        //Add new item API
        app.post('/auto', async (req, res) => {
            const newItem = req.body;
            const result = await autosCollection.insertOne(newItem);
            res.send(result);
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