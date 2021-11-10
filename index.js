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



        // POST API
        app.post('/properties', async (req, res) => {
            const property = req.body;
            console.log(property)
            const result = await propertiesCollection.insertOne(property);
            res.json(result)
        });
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