const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = 3000


// middleware
app.use(cors({
  origin: ['https://omni-task-server.vercel.app', 'http://localhost:3000', 'https://omni-task-server-coderomayer-omayers-projects.vercel.app', 'http://localhost:5173', 'https://omni-task.vercel.app'],
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json());





const uri = "mongodb+srv://omayer:mx8iqTtgwCPVB4N1@cluster0.ussu9py.mongodb.net/?retryWrites=true&w=majority";

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
    // await client.connect();

    const userCollection = client.db('OmniTask').collection('users')
    const taskCollection = client.db('OmniTask').collection('task')

    // Users

    app.post('/users', async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data);
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    // Get user by email
    app.get('/users/:email', async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await userCollection.findOne(query);
      res.send(result)
    });

    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result)
    })

    // Uddate User data

    app.patch('/users/:id', async (req, res) => {
      try {
        const userId = req.params.id;
        const query = { _id: new ObjectId(userId) };
        const updatedUser = {
          $set: {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            bloodGroup: req.body.bloodGroup,
            district: req.body.district,
            upazila: req.body.upazila,
            file: req.body.file,
          },
        };

        const result = await userCollection.updateOne(query, updatedUser);

        if (result.matchedCount > 0) {
          res.send({ updatedUser: true });
        } else {
          res.status(404).send({ updatedUser: false, message: 'User not found' });
        }
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send({ updatedUser: false, message: 'Internal Server Error' });
      }
    });


    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })



    // Task Data

    
    app.get('/task', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });
    

    app.post('/task', async (req, res) => {
      const data = req.body;
      const result = await taskCollection.insertOne(data)
      res.send(result)
    })

    // Delete

    app.delete('/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await taskCollection.deleteOne(query);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})