const express = require("express");
const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User");
const redis = require("redis");

// Initialize Redis client
const redisClient = redis.createClient({
  url: 'redis://localhost:6379' // Adjust URL if your Redis is hosted elsewhere
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");

    const app = express();
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // POST /users (Create a user)
    app.post("/users", async (req, res) => {
      try {
        const user = AppDataSource.manager.create(User, {
          name: req.body.name,
          email: req.body.email,
        });

        await AppDataSource.manager.save(User, user);
        // Invalidate users cache
        await redisClient.del('users');
        res.send("User saved");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to create user");
      }
    });

    // GET /users (Fetch all users with Redis caching)
    app.get("/users", async (req, res) => {
      try {
        // Check Redis cache first
        const cachedUsers = await redisClient.get('users');
        if (cachedUsers) {
          return res.send(JSON.parse(cachedUsers));
        }

        // If not in cache, fetch from database
        const users = await AppDataSource.manager.find(User);
        // Store in Redis with 1 hour expiration
        await redisClient.setEx('users', 3600, JSON.stringify(users));
        res.send(users);
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch users");
      }
    });

    // PUT /users/:id (Update user by ID)
    app.put("/users/:id", async (req, res) => {
      try {
        const user = await AppDataSource.manager.findOne(User, {
          where: { id: parseInt(req.params.id) },
        });

        if (user) {
          user.name = req.body.name;
          user.email = req.body.email;
          await AppDataSource.manager.save(User, user);
          // Invalidate users cache
          await redisClient.del('users');
          res.send("User updated");
        } else {
          res.status(404).send("User not found");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update user");
      }
    });

    // DELETE /users/:id (Delete user by ID)
    app.delete("/users/:id", async (req, res) => {
      try {
        const user = await AppDataSource.manager.findOne(User, {
          where: { id: parseInt(req.params.id) },
        });

        if (user) {
          await AppDataSource.manager.remove(User, user);
          // Invalidate users cache
          await redisClient.del('users');
          res.send("User deleted");
        } else {
          res.status(404).send("User not found");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to delete user");
      }
    });

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.log("Error during Data Source initialization:", error));

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redisClient.quit();
  process.exit(0);
});