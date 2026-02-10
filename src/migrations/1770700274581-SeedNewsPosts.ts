import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedNewsPosts1770700274581 implements MigrationInterface {
  name = "SeedNewsPosts1770700274581";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = "seed.user@example.com";
    const userResult = await queryRunner.query(
      'SELECT id FROM "users" WHERE "email" = $1',
      [email],
    );

    if (userResult.length === 0) {
      return;
    }

    const userId = userResult[0].id as string;

    // Keep the seed dataset predictable by replacing any existing posts for the seed user.
    await queryRunner.query('DELETE FROM "posts" WHERE "userId" = $1', [userId]);

    const posts: Array<{ title: string; content: string; published: boolean }> = [
      {
        title: "IOC Weighs Earlier Winter Games Dates Due to Warming",
        content:
          "The IOC said it is considering staging future Winter Olympic Games as early as January, with the Paralympics potentially in February, due to warmer temperatures and scheduling concerns. The proposal is part of a wider review of the winter program.\n\nSources:\n- https://apnews.com/article/450bcd7c820ce55efe6ea0aa53c213d1",
        published: true,
      },
      {
        title: "WEF Annual Meeting 2026 Reports Record Participation in Davos",
        content:
          "The World Economic Forum said its 56th Annual Meeting ran on 19-23 January 2026 in Davos-Klosters under the theme \"A Spirit of Dialogue\". The forum reported close to 3,000 leaders from 130 countries, including a record 400 political leaders.\n\nSources:\n- https://www.weforum.org/press/2026/01/annual-meeting-2026-a-spirit-of-dialogue-ceb3ae9c08/",
        published: true,
      },
      {
        title: "Munich Security Conference 2026 Dates and Venue Confirmed",
        content:
          "The Munich Security Conference main meeting is scheduled for 13-15 February 2026 in Munich, Germany. The event is listed at the Hotel Bayerischer Hof and Rosewood venues.\n\nSources:\n- https://defence-industry-space.ec.europa.eu/munich-security-conference-2026-02-13_en",
        published: true,
      },
      {
        title: "BRIT Awards 2026 Move to Manchester",
        content:
          "The BRIT Awards 2026 are set for 28 February 2026 at Co-op Live in Manchester, marking the show's first move to the city. Jack Whitehall is confirmed as host.\n\nSources:\n- https://www.cooplive.com/events/brit-awards-hmvz\n- https://www.brits.co.uk/news/2026/jack-whitehall-is-heading-to-manchester/",
        published: true,
      },
      {
        title: "ICC Women's T20 World Cup Qualifier 2026 Scheduled in Nepal",
        content:
          "The ICC confirmed that 10 teams will play the Women's T20 World Cup Qualifier in Nepal from 18 January to 1 February 2026 for four qualification spots. Warm-up matches are scheduled for 14 and 16 January at venues in Kathmandu.\n\nSources:\n- https://www.icc-cricket.com/media-releases/icc-women-s-t20-world-cup-2026-qualifier-schedule-confirmed/",
        published: true,
      },
      {
        title: "UNESCO Director-General Visit to Pakistan Announced",
        content:
          "UNESCO said Director-General Dr. Khaled El-Enany visited Pakistan on 1-2 February 2026, meeting national leaders and ministers. The visit resulted in a joint decision to develop a new strategic roadmap for cooperation.\n\nSources:\n- https://pakistan.un.org/en/309698-media-update-united-nations-pakistan-6-february-2026",
        published: true,
      },
      {
        title: "UNEP INC-5.3 Plastic Treaty Resumed Session Held in Geneva",
        content:
          "UNEP reported the INC-5.3 resumed session on plastic pollution was held on 7 February 2026 at the Geneva International Conference Centre. The one-day meeting was limited to organizational and administrative matters, including the election of officers.\n\nSources:\n- https://www.unep.org/inc-plastic-pollution/session-5.3",
        published: true,
      },
      {
        title: "WHO Appeals for $1B for 2026 Health Emergencies",
        content:
          "At a UN Geneva press briefing on 3 February 2026, WHO's Health Emergencies Programme appealed for USD 1 billion to sustain essential health services across 36 emergencies in 2026.\n\nSources:\n- https://www.ungeneva.org/en/news-media/press-briefing/2026/02/un-geneva-press-briefing",
        published: true,
      },
      {
        title: "WEF Global Collaboration and Growth Meeting Set for Jeddah",
        content:
          "The World Economic Forum lists the Global Collaboration and Growth Meeting for 22-23 April 2026 in Jeddah, Saudi Arabia.\n\nSources:\n- https://www.weforum.org/meetings/world-economic-forum-on-global-collaboration-and-growth-2026/",
        published: true,
      },
      {
        title: "WEF New Champions Meeting 2026 Scheduled for Dalian",
        content:
          "The World Economic Forum's Annual Meeting of the New Champions is scheduled for 23-25 June 2026 in Dalian, China. The meeting will focus on innovation, emerging technologies, and growth in emerging markets.\n\nSources:\n- https://www.weforum.org/meetings/annual-meeting-of-the-new-champions-2026/about/",
        published: true,
      },
    ];

    for (const post of posts) {
      await queryRunner.query(
        'INSERT INTO "posts" ("id", "title", "content", "published", "userId", "createdAt", "updatedAt") VALUES (uuid_generate_v4(), $1, $2, $3, $4, now(), now())',
        [post.title, post.content, post.published, userId],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = "seed.user@example.com";
    const userResult = await queryRunner.query(
      'SELECT id FROM "users" WHERE "email" = $1',
      [email],
    );

    if (userResult.length === 0) {
      return;
    }

    const userId = userResult[0].id as string;
    const titles = [
      "IOC Weighs Earlier Winter Games Dates Due to Warming",
      "WEF Annual Meeting 2026 Reports Record Participation in Davos",
      "Munich Security Conference 2026 Dates and Venue Confirmed",
      "BRIT Awards 2026 Move to Manchester",
      "ICC Women's T20 World Cup Qualifier 2026 Scheduled in Nepal",
      "UNESCO Director-General Visit to Pakistan Announced",
      "UNEP INC-5.3 Plastic Treaty Resumed Session Held in Geneva",
      "WHO Appeals for $1B for 2026 Health Emergencies",
      "WEF Global Collaboration and Growth Meeting Set for Jeddah",
      "WEF New Champions Meeting 2026 Scheduled for Dalian",
    ];

    await queryRunner.query(
      'DELETE FROM "posts" WHERE "userId" = $1 AND "title" = ANY($2)',
      [userId, titles],
    );
  }
}
