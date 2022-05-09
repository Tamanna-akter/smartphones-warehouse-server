const express = require('express');
const cors = require('cors');
const jwt =require('jsonwebtoken')
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
        const addItemCollection=client.db('newItemCollections').collection('newItem');



        app.get('/phones', async (req, res) => {
            const query = {};
            const cursor = phoneCollections.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET single item API using dynamic id
        app.get('/phoneDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const phone = await phoneCollections.findOne(query);
            res.send(phone);
        })
        // Add item API
        app.post('/phones', async (req, res) => {
            const newPhone = req.body;
            const result = await phoneCollections.insertOne(newPhone);
            // console.log(result);
            res.send(result);
        });
       
    //JWT
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
          expiresIn: '1d'
      });
      res.send({ accessToken });
  })


         //DELETE
        app.delete("/phones/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await phoneCollections.deleteOne(query);
        res.send(result);
      });

        //PUT
    app.put("/phones/:id", async (req, res) => {
        const id = req.params.id;
        const updatedQuantity = req.body;
        const filter = { _id: ObjectId(id) };
        console.log(updatedQuantity);
        const updatedDoc = {
          $set: {
            quantity: updatedQuantity.quantity,
            // about: updatedService.about,
          },
        };
  
        const options = { upsert: true };
        const result = await phoneCollections.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      });

      app.get("/addItem", async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const cursor = await addItemCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });
  
      app.post("/addItem", async (req, res) => {
        const item = req.body;
        const result = await addItemCollection.insertOne(item);
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
