import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedUser1770697529080 implements MigrationInterface {
  name = 'SeedUser1770697529080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = 'seed.user@example.com';
    const name = 'Seed User';
    const plainPassword = 'Password123!';

    const existing = await queryRunner.query(
      'SELECT id FROM "users" WHERE "email" = $1',
      [email],
    );

    if (existing.length > 0) {
      return;
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await queryRunner.query(
      'INSERT INTO "users" ("id", "email", "name", "password", "createdAt", "updatedAt") VALUES (uuid_generate_v4(), $1, $2, $3, now(), now())',
      [email, name, passwordHash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "users" WHERE "email" = $1', [
      'seed.user@example.com',
    ]);
  }
}
