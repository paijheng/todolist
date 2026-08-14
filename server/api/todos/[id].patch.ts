import { sql, toTodo } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!Number.isInteger(Number(id))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' });
  }

  const body = await readBody<{ title?: string; completed?: boolean }>(event);
  const title = body.title?.trim();

  const [row] = await sql`
    UPDATE todos
    SET title = COALESCE(${title}, title),
        completed = COALESCE(${body.completed}, completed)
    WHERE id = ${id}
    RETURNING *
  `;

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' });
  }

  return toTodo(row as any);
});
