const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class initial1625610830176 {
  name = "initial1625610830176";

  async up(queryRunner) {
    await queryRunner.query(
      "CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `username` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `hashedPassword` varchar(255) NOT NULL, UNIQUE INDEX `IDX_cd31913550dca61bd410900cdb` (`id`, `username`, `email`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      "DROP INDEX `IDX_cd31913550dca61bd410900cdb` ON `user`"
    );
    await queryRunner.query("DROP TABLE `user`");
  }
};
