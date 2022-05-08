const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//mongodb to server connection


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rh8rp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
     console.log('connected');
        const phoneCollections = client.db('smartphonesWarehouse').collection('phones');

        // const phoneDetails  = database.collection('details');


        app.get('/phones', async (req, res) => {
            const query = {};
            const cursor = phoneCollections.find(query);
            const phones = await cursor.toArray();
            res.send(phones);
        });

        // GET single item API using dynamic id
        app.get('/phoneDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const phone = await phoneCollections.findOne(query);
            res.send(phone);
        })
        // Add item API
        app.post('/addPhones', async (req, res) => {
            const newPhone = req.body;
            const result = await phoneCollections.insertOne(newPhone);
            res.send(result);
        });

         //DELETE
        app.delete("/phones/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await phoneCollections.deleteOne(query);
        res.send(result);
      });

    }
    finally{

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running warehouse Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})
