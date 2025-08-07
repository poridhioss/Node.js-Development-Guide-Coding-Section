const express = require("express");
const { AppDataSource } = require("./data-source");

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    
    const app = express();
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.log("Error during Data Source initialization:", error));