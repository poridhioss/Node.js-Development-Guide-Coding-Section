
const express = require("express");
const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User"); // Must be the actual entity, not a string

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
        res.send("User saved");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to create user");
      }
    });

    // GET /users (Fetch all users)
    app.get("/users", async (req, res) => {
      try {
        const users = await AppDataSource.manager.find(User);
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