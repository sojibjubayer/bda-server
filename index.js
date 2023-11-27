const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()


const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY);
const port = process.env.PORT || 5000;

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
    const donationRequestCollection = client.db("bdaDB").collection("donationRequests");
    const paymentCollection = client.db("bdaDB").collection("payments");

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })
      res.send({ token })
    })

    // middlewares
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization)
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' })
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next()
      })
    }
    // verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await userCollection.findOne(query)
      const isAdmin = user?.role === 'admin'
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden  access' })
      }
      next()
    }







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



    // admin related api
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let admin = false;
      if (user) {
        admin = user?.role === 'admin'
      }
      res.send({ admin })
    })




    // get donation request by email
    app.get('/donationRequests', async (req, res) => {
      const email = req.query.email;
      const query = { reqEmail: email };
      const result = await donationRequestCollection.find(query).toArray();
      res.send(result);
    });


    //ALL Donation Request
    app.get('/AlldonationRequests', async (req, res) => {
      const result = await donationRequestCollection.find().toArray();
      res.send(result);
    });


    app.get('/donationRequests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await donationRequestCollection.findOne(query);
      res.send(result);
    })

    app.patch('/donationRequests/:id', async (req, res) => {
      const info = req.body;
      console.log(info)
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          reqName: info.reqName,
          reqEmail: info.reqEmail,
          reciName: info.reciName,
          bloodGroup: info.bloodGroup,
          reciDistrict: info.reciDistrict,
          reciUpazila: info.reciUpazila,
          hospitalName: info.hospitalName,
          fullAddress: info.fullAddress,
          donationDate: info.donationDate,
          donationTime: info.donationTime,
          requestMessage: info.requestMessage,
          donationStatus: info.donationStatus,


        }
      }
      const result = await donationRequestCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    app.delete('/donationRequest/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await donationRequestCollection.deleteOne(query);
      res.send(result);
    })

    // CONFIRM DONATION UPDATE
    

    app.patch('/confirmDonation/:id', async (req, res) => {
      
        const info = req.body;
        console.log(info);
    
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        console.log(filter);
    
        const updatedDoc = {
          $set: {
            donationStatus: info.donationStatus,
          },
        };
    
        const result = await donationRequestCollection.updateOne(filter, updatedDoc);
      res.send(result)
        
     
    });
    


    //CREATE DONATION REQUEST POST
    app.post('/donationRequest', async (req, res) => {
      const request = req.body;
      const result = await donationRequestCollection.insertOne(request)
      res.send(result)
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

