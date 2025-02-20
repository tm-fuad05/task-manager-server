require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dmsil.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Database & Collection
    const database = client.db("TaskManagerDB");
    const collection = database.collection("collection");

    // Jwt Api
    app.post("/jwt", async (req, res) => {
      try {
        const user = req.body;
        if (!user?.email) {
          return res
            .status(400)
            .json({ success: false, message: "invalid email" });
        }
        const token = jwt.sign(user, process.env.ACCESS_SEC_TOKEN, {
          expiresIn: "24h",
        });

        return res.status(200).json({
          success: true,
          token,
        });
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
