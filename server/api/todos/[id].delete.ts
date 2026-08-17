export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!Number.isInteger(Number(id))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' });
  }

  const [row] = await sql`DELETE FROM todos WHERE id = ${id} RETURNING id`;
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' });
  }
  return { id: String(row.id) };
});
