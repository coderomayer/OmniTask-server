const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, Collection, ObjectId } = require('mongodb');
const app = express()
const port = 3000


// middleware
app.use(cors({
  origin: ['https://OmniTask-server-ten.vercel.app', 'http://localhost:3000', 'https://lifeflow-25df5.web.app', 'http://localhost:5173'],
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

    const districtCollection = client.db('OmniTask').collection('district')
    const upazilaCollection = client.db('OmniTask').collection('upazila')
    const userCollection = client.db('OmniTask').collection('user')
    const DonationRequestCollection = client.db('OmniTask').collection('donationRequest')
    const BlogsCollection = client.db('OmniTask').collection('blogs')

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



    // /Donation Requests

    app.post('/donation-requests', async (req, res) => {
      const query = req.body;
      const result = await DonationRequestCollection.insertOne(query);
      res.send(result)
    })

    app.get('/donation-requests', async (req, res) => {
      const result = await DonationRequestCollection.find().toArray();
      res.send(result)
    })

    // ...

    app.get('/donation-requests/:email', async (req, res) => {
      try {
        const requesterEmail = req.params.email;
        const query = { 'requesterEmail': requesterEmail }; // Corrected query for nested email field
        const result = await DonationRequestCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching donation requests:", error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.get('/donation-requests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await DonationRequestCollection.findOne(query);
      res.send(result);
    });


    // Update Donation Request data
    app.patch('/donation-requests/:id', async (req, res) => {
      try {
        const requestId = req.params.id;
        const query = { _id: new ObjectId(requestId) };
        const updatedDonationRequest = {
          $set: {
            requesterName: req.body.requesterName,
            requesterEmail: req.body.requesterEmail,
            recipientName: req.body.recipientName,
            recipientDistrict: req.body.recipientDistrict,
            recipientUpazila: req.body.recipientUpazila,
            hospitalName: req.body.hospitalName,
            fullAddress: req.body.fullAddress,
            donationDate: req.body.donationDate,
            donationTime: req.body.donationTime,
            requestMessage: req.body.requestMessage,
            donationStatus: req.body.donationStatus,
          },
        };

        const result = await DonationRequestCollection.updateOne(query, updatedDonationRequest);

        if (result.matchedCount > 0) {
          res.send({ updatedDonationRequest: true });
        } else {
          res.status(404).send({ updatedDonationRequest: false, message: 'Donation request not found' });
        }
      } catch (error) {
        console.error("Error updating donation request:", error);
        res.status(500).send({ updatedDonationRequest: false, message: 'Internal Server Error' });
      }
    });



    app.delete('/donation-requests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await DonationRequestCollection.deleteOne(query);
      res.send(result);
    });

    // ...

    // Blog

    app.post('/blogs', async (req, res) => {
      const query = req.body;
      const result = await BlogsCollection.insertOne(query);
      res.send(result)
    })

    app.get('/blogs', async (req, res) => {
      const result = await BlogsCollection.find().toArray()
      res.send(result)
    })




    // District Data
    app.get('/district', async (req, res) => {
      const result = await districtCollection.find().toArray();
      res.send(result)
    })

    // upazila Data
    app.get('/upazila', async (req, res) => {
      const result = await upazilaCollection.find().toArray();
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