const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class GoogleAuth1625920965159 {
    name = 'GoogleAuth1625920965159'

    async up(queryRunner) {
        await queryRunner.query("DROP INDEX `IDX_cd31913550dca61bd410900cdb` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `username`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `hashedPassword`");
        await queryRunner.query("ALTER TABLE `user` ADD `name` varchar(255) NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_cefdd2c812c1e52d6d7169db1d` ON `user` (`id`, `name`, `email`)");
    }

    async down(queryRunner) {
        await queryRunner.query("DROP INDEX `IDX_cefdd2c812c1e52d6d7169db1d` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `name`");
        await queryRunner.query("ALTER TABLE `user` ADD `hashedPassword` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `username` varchar(255) NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_cd31913550dca61bd410900cdb` ON `user` (`id`, `username`, `email`)");
    }
}
