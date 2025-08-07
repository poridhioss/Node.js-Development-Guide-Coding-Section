const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User"); // EntitySchema

AppDataSource.initialize()
  .then(async () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
    };

    await AppDataSource.getRepository(User).save(user);
    console.log("Seed data inserted");
  })
  .catch((error) => console.log(error));