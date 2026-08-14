import { sql } from '~~/server/utils/db';

export default defineEventHandler(async () => {
  const [row] = await sql`
    WITH deleted AS (DELETE FROM todos WHERE completed = true RETURNING id)
    SELECT count(*)::int AS deleted FROM deleted
  `;
  return { deleted: (row as any).deleted };
});
