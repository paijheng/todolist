export default defineEventHandler(async (event) => {
  const body = await readBody<{ title?: string; completed?: boolean }>(event);
  const title = body.title?.trim();
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' });
  }

  const [row] = await sql`INSERT INTO todos (title, completed) VALUES (${title}, ${body.completed ?? false}) RETURNING *`;
  return toTodo(row as any);
});
