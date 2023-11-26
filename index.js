const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY);
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j998cjx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("bdaDB").collection("users");
    const districtsCollection = client.db("bdaDB").collection("districts");
    const upazilasCollection = client.db("bdaDB").collection("upazilas");
    const cartCollection = client.db("bdaDB").collection("carts");
    const paymentCollection = client.db("bdaDB").collection("payments");






    //collecting data from db to update
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result);
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get('/districts', async (req, res) => {
        const result = await districtsCollection.find().toArray()
        res.send(result);
      })
    app.get('/upazilas', async (req, res) => {
        const result = await upazilasCollection.find().toArray()
        res.send(result);
      })



 






 
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('boss is sitting')
})

app.listen(port, () => {
  console.log(`BDA server is running on port: ${port}`);
})

