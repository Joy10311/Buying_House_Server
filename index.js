const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.znwze.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();

        const database = client.db('Buying_House');
        const propertiesCollection = database.collection('properties');
        const ordersCollection = database.collection('orders')
        const reviewCollection = database.collection('review')
        const usersCollection = database.collection('users')



        // POST API
        app.post('/properties', async (req, res) => {
            const property = req.body;
            console.log(property)
            const result = await propertiesCollection.insertOne(property);
            res.json(result)
        });
        // POST USERS API
        app.post('/users', async (req, res) => {
            const users = req.body;
            
            const result = await usersCollection.insertOne(users);
            res.json(result)
            console.log(result)
        });


        // GET USERS API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        
// ADMIN PUT 
        app.put('/users/admin', async(req,res)=> {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



// GET API 
app.get('/properties', async (req, res) => {
    const cursor = propertiesCollection.find({});
    const properties = await cursor.toArray();
    res.send(properties);
});

//POST USERS REVIEW 
app.post("/addReview", async (req, res) => {
    const result = await reviewCollection.insertOne(req.body);
    res.send(result);
  });

// POST ORDERS
app.post('/addOrders', async(req,res)=>{
    const newOrder = req.body;
    const result = await ordersCollection.insertOne(newOrder);
    res.json(result);
})

// GET API by email
app.get('/processOrders/:email', async (req, res) => {
    const userEmail = req.params.email;
    console.log(userEmail);
    const myOrder = await ordersCollection.find({ email: req.params.email }).toArray();
    res.json(myOrder);
});

// Get Api from orders
app.get('/processOrders', async (req, res) => {
    const getOrders = await ordersCollection.find({}).toArray();
    res.json(getOrders)
});


// GET REVIEWS
app.get('/addReview', async(req,res)=>{
    const cursor = reviewCollection.find({});
    const review = await cursor.toArray();
    res.send(review);
})

// Get single API
app.get('/properties/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    const properties = await propertiesCollection.findOne(query);
    res.json(properties)

});


// Delete API 
app.delete('/processOrders/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    const result = await ordersCollection.deleteOne(query);
    res.json(result)
});
// Delete API 
app.delete('/properties/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    const result = await propertiesCollection.deleteOne(query);
    res.json(result)
});

    }
    finally{
    //    await client.close()
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});