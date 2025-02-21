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
    const userCollection = database.collection("users");
    const taskCollection = database.collection("tasks");

    // Middleware
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: "Unauthorized access!" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            return res.status(401).json({ message: "Unauthorized access!" });
          }
          req.decoded = decoded;
          next();
        }
      );
    };

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

    // User Api
    app.post("/users", async (req, res) => {
      try {
        const userInfo = req.body;
        if (!userInfo?.email) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid email" });
        }

        const query = { email: userInfo?.email };

        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res
            .status(409)
            .json({ success: false, message: "User already exists." });
        }

        const result = await userCollection.insertOne(userInfo);

        if (result.insertedId) {
          return res.status(201).json({ success: true });
        }
        return res.status(500).json({
          success: false,
          message: "Failed to add the user.",
        });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    });

    app.get("/users", verifyToken, async (req, res) => {
      try {
        const result = await userCollection.find().toArray();

        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    });

    // TaskApi
    app.post("/tasks", async (req, res) => {
      try {
        const taskData = req.body;

        if (!taskData || Object.keys(taskData).length === 0) {
          return res
            .status(400)
            .json({ success: false, message: "TaskData data is required." });
        }

        const result = await taskCollection.insertOne(taskData);

        if (result.insertedId) {
          return res.status(201).json({ success: true });
        }
        return res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    });

    app.get("/tasks", async (req, res) => {
      try {
        const result = await taskCollection.find().toArray();

        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    });

    // Task: TO-DO
    app.get("/tasks/to-do", async (req, res) => {
      try {
        const result = await taskCollection
          .find({ category: "To-Do" })
          .toArray();

        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
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
