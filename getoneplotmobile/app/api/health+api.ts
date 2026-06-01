export async function GET(request: Request) {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() }, { status: 200 });
}
