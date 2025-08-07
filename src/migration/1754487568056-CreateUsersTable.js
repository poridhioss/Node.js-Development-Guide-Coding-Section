const { MigrationInterface, QueryRunner } = require("typeorm");

class CreateUsersTable1754487568056 {
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}

module.exports = CreateUsersTable1754487568056;