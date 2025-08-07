const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
    email: {
      type: "varchar",
    },
  },
  relations: {
    posts: {
      type: "one-to-many",
      target: "Post",
      inverseSide: "user",
    },
  },
});

module.exports = { User };