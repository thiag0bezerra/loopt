import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTags1769094945568 implements MigrationInterface {
    name = 'CreateTags1769094945568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "color" character varying(7) NOT NULL DEFAULT '#6366f1', "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74603743868d1e4f4fc2c0225b" ON "tags" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1d8718578ce96a09d1aa2237a1" ON "tags" ("user_id", "name") `);
        await queryRunner.query(`CREATE TABLE "task_tags" ("task_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_a7354e3c3f630636f6e4a29694a" PRIMARY KEY ("task_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_70515bc464901781ac60b82a1e" ON "task_tags" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f883135d033e1541f6a81972e7" ON "task_tags" ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "FK_74603743868d1e4f4fc2c0225b6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_tags" ADD CONSTRAINT "FK_70515bc464901781ac60b82a1ea" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_tags" ADD CONSTRAINT "FK_f883135d033e1541f6a81972e7d" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_tags" DROP CONSTRAINT "FK_f883135d033e1541f6a81972e7d"`);
        await queryRunner.query(`ALTER TABLE "task_tags" DROP CONSTRAINT "FK_70515bc464901781ac60b82a1ea"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_74603743868d1e4f4fc2c0225b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f883135d033e1541f6a81972e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70515bc464901781ac60b82a1e"`);
        await queryRunner.query(`DROP TABLE "task_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d8718578ce96a09d1aa2237a1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74603743868d1e4f4fc2c0225b"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }

}
