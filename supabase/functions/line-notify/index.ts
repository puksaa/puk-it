// Deploy: supabase functions deploy line-notify --no-verify-jwt
// Required secrets: LINE_CHANNEL_ACCESS_TOKEN, LINE_TO, WEBHOOK_SECRET
Deno.serve(async (request) => {
  if (request.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) return new Response('Unauthorized', { status: 401 });
  const payload = await request.json(); const lead = payload.record;
  if (!lead) return new Response('Missing lead', { status: 400 });
  const text = `📩 มีลูกค้าส่งคำขอใหม่\nชื่อ: ${lead.name}\nติดต่อ: ${lead.contact}\nบริการ: ${lead.service}\nรายละเอียด: ${lead.message}`;
  const response = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')}` }, body: JSON.stringify({ to: Deno.env.get('LINE_TO'), messages: [{ type: 'text', text }] }) });
  return new Response(await response.text(), { status: response.status });
});
