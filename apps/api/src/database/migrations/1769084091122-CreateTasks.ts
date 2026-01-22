import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasks1769084091122 implements MigrationInterface {
  name = 'CreateTasks1769084091122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('pending', 'in_progress', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" character varying(1000), "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'pending', "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium', "due_date" TIMESTAMP, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db55af84c226af9dce09487b61" ON "tasks" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_42d2fed7a02bb2ac4534fa8c71" ON "tasks" ("user_id", "priority") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7af812c1f8f4035af0934e3d9" ON "tasks" ("user_id", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_db55af84c226af9dce09487b61b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7af812c1f8f4035af0934e3d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_42d2fed7a02bb2ac4534fa8c71"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db55af84c226af9dce09487b61"`,
    );
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
  }
}
