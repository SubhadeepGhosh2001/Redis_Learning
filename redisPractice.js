import express from "express";
import axios from "axios";
import { createClient } from "redis";

const app = express();
const PORT = 3000;

// Redis client
const redisClient = createClient();

redisClient.on("error", (err) => console.log("Redis Error:", err));

await redisClient.connect();

// API route
app.get("/posts", async (req, res) => {
  try {
    const cacheKey = "posts";

    //  Check Redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache HIT");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Cache MISS");

    //  Fetch from JSONPlaceholder
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    const data = response.data;

    // store in Redis (expire in 60 sec)
    await redisClient.setEx(cacheKey, 60, JSON.stringify(data));

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
