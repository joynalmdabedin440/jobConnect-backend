const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xwror.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const jobsData = client.db('jobConnect').collection('jobs')
    const jobApplications = client.db("jobConnect").collection("applications")

    //jobs data api

    app.get('/jobs', async (req, res) => {
      const cursor = jobsData.find()


      const result = await cursor.toArray()

      res.send(result)
    })

    app.get('/jobs/:id', async (req, res) => {

      let id = req.params.id

      let query = { _id: new ObjectId(id) }

      const result = await jobsData.findOne(query)

      res.send(result)


    })
    //job application api
    app.post('/applications', async (req, res) => {
      const application = req.body
      const result = await jobApplications.insertOne(application)
      res.send(result)
    })

    //get applications by email
    app.get('/applications', async (req, res) => {
      const email = req.query.email
      const query = { userEmail: email }

      const result = await jobApplications.find(query).toArray()

      for (let application of result) {
        let jobId = application.jobId
        const query2 = { _id: new ObjectId(jobId) }
        let job = await jobsData.findOne(query2)
        application.title = job.title
        application.location = job.location
        application.company = job.company
        application.logo = job.company_logo
        application.applicationDeadline = job.applicationDeadline
        application.appliedTime = job._id.getTimestamp().toLocaleDateString()




      }



      res.send(result)



    })





  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("running successfully")
})


app.listen(port, () => {
  console.log("This server is running successfully");

})