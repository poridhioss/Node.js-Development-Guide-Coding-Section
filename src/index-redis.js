require("dotenv").config(); // ✅ Load env vars first

const express = require("express");
const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User");
const redis = require("redis");

// ✅ Initialize Redis client from .env
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Data Source has been initialized!");

    const app = express();
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // ✅ Create user
    app.post("/users", async (req, res) => {
      try {
        const user = AppDataSource.manager.create(User, {
          name: req.body.name,
          email: req.body.email,
        });

        await AppDataSource.manager.save(User, user);
        await redisClient.del('users'); // Invalidate cache
        res.send("User saved");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to create user");
      }
    });

    // ✅ Get users (with Redis caching)
    app.get("/users", async (req, res) => {
      try {
        const cachedUsers = await redisClient.get('users');
        if (cachedUsers) {
          return res.send(JSON.parse(cachedUsers));
        }

        const users = await AppDataSource.manager.find(User);
        await redisClient.setEx('users', 3600, JSON.stringify(users)); // Cache 1hr
        res.send(users);
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch users");
      }
    });

    // ✅ Update user
    app.put("/users/:id", async (req, res) => {
      try {
        const user = await AppDataSource.manager.findOne(User, {
          where: { id: parseInt(req.params.id) },
        });

        if (user) {
          user.name = req.body.name;
          user.email = req.body.email;
          await AppDataSource.manager.save(User, user);
          await redisClient.del('users'); // Invalidate cache
          res.send("User updated");
        } else {
          res.status(404).send("User not found");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update user");
      }
    });

    // ✅ Delete user
    app.delete("/users/:id", async (req, res) => {
      try {
        const user = await AppDataSource.manager.findOne(User, {
          where: { id: parseInt(req.params.id) },
        });

        if (user) {
          await AppDataSource.manager.remove(User, user);
          await redisClient.del('users'); // Invalidate cache
          res.send("User deleted");
        } else {
          res.status(404).send("User not found");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to delete user");
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("❌ Error during Data Source initialization:", error));

// ✅ Graceful shutdown
process.on('SIGTERM', async () => {
  console.log("Shutting down...");
  await redisClient.quit();
  process.exit(0);
});
