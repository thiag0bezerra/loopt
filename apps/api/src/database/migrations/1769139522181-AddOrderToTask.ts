import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderToTask1769139522181 implements MigrationInterface {
  name = 'AddOrderToTask1769139522181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "order" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a672f5f6d03ed69a71f5ae8e80" ON "tasks" ("order") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a672f5f6d03ed69a71f5ae8e80"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "order"`);
  }
}
