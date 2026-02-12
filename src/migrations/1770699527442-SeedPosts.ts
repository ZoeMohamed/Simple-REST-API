// Seed migration for initial posts.

import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPosts1770699527442 implements MigrationInterface {
  name = 'SeedPosts1770699527442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = 'seed.user@example.com';
    const userResult = await queryRunner.query(
      'SELECT id FROM "users" WHERE "email" = $1',
      [email],
    );

    if (userResult.length === 0) {
      return;
    }

    const userId = userResult[0].id as string;

    const posts = [
      {
        title: 'Welcome to the API',
        content: 'This is a seeded post created during migration.',
        published: true,
      },
      {
        title: 'Second Seeded Post',
        content: 'Use this post to test list and detail endpoints.',
        published: false,
      },
    ];

    for (const post of posts) {
      const exists = await queryRunner.query(
        'SELECT id FROM "posts" WHERE "title" = $1 AND "userId" = $2',
        [post.title, userId],
      );

      if (exists.length > 0) {
        continue;
      }

      await queryRunner.query(
        'INSERT INTO "posts" ("id", "title", "content", "published", "userId", "createdAt", "updatedAt") VALUES (uuid_generate_v4(), $1, $2, $3, $4, now(), now())',
        [post.title, post.content, post.published, userId],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "posts" WHERE "userId" IN (SELECT id FROM "users" WHERE "email" = $1)',
      ['seed.user@example.com'],
    );
  }
}
