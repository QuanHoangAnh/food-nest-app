import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757874363964 implements MigrationInterface {
    name = 'Init1757874363964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recipes" ("id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(10000), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, "last_modified_at" TIMESTAMP DEFAULT now(), "last_modified_by" uuid, "version" integer NOT NULL DEFAULT '1', "deleted_at" TIMESTAMP, CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recipe_ingredients" ("id" uuid NOT NULL, "quantity" numeric(10,4) NOT NULL, "recipe_id" uuid NOT NULL, "ingredient_id" uuid NOT NULL, CONSTRAINT "PK_8f15a314e55970414fc92ffb532" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "price_history" ("id" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "changed_at" TIMESTAMP NOT NULL, "ingredient_id" uuid NOT NULL, CONSTRAINT "PK_e41e25472373d4b574b153229e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ingredients" ("id" uuid NOT NULL, "name" character varying(255) NOT NULL, "supplier" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, "last_modified_at" TIMESTAMP DEFAULT now(), "last_modified_by" uuid, "version" integer NOT NULL DEFAULT '1', "deleted_at" TIMESTAMP, CONSTRAINT "UQ_a955029b22ff66ae9fef2e161f8" UNIQUE ("name"), CONSTRAINT "PK_9240185c8a5507251c9f15e0649" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_history" ADD CONSTRAINT "FK_dde0716337211e53dd1d04c5594" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_history" DROP CONSTRAINT "FK_dde0716337211e53dd1d04c5594"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_f240137e0e13bed80bdf64fed53"`);
        await queryRunner.query(`DROP TABLE "ingredients"`);
        await queryRunner.query(`DROP TABLE "price_history"`);
        await queryRunner.query(`DROP TABLE "recipe_ingredients"`);
        await queryRunner.query(`DROP TABLE "recipes"`);
    }

}
