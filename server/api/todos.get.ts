export default defineEventHandler(async () => {
  const rows = await sql`SELECT * FROM todos ORDER BY id DESC`;
  return (rows as any[]).map(toTodo);
});
