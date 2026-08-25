import 'reflect-metadata';
import 'dotenv/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { Comment } from '../src/comments/comment.entity';
import { PostStats } from '../src/stats/post-stats.entity';

/**
 * SQLite 数据库初始化脚本：
 * 1. 确保 data/ 目录存在；
 * 2. 创建/同步表结构（comments、post_stats）；
 * 3. 输出 DB 文件绝对路径。
 *
 * 运行：npm run db:init
 * 数据文件由 .env 的 DB_PATH 指定（默认 ./data/app.db）。
 * 注意：synchronize 仅建议开发期使用；生产切换 Postgres 前改为 migration。
 */
async function init(): Promise<void> {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    console.log(`已创建数据目录：${dataDir}`);
  }

  const dbPath = join(process.cwd(), process.env.DB_PATH ?? 'data/app.db');
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [Comment, PostStats],
    synchronize: true,
  });

  await dataSource.initialize();
  const tables = await dataSource.query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  await dataSource.destroy();

  console.log(`✅ SQLite 已初始化：${dbPath}`);
  console.log('   表结构：', tables.map((t: { name: string }) => t.name).join(', '));
}

void init().catch((err) => {
  console.error('❌ SQLite 初始化失败：', err);
  process.exit(1);
});
