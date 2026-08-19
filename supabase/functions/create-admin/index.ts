import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  const auth = request.headers.get('Authorization');
  if (!auth) return new Response('Unauthorized', { status: 401, headers });
  const url = Deno.env.get('SUPABASE_URL')!; const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await userClient.auth.getUser(); if (!user) return new Response('Unauthorized', { status: 401, headers });
  const admin = createClient(url, serviceKey); const { data: caller } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!caller?.is_admin) return new Response('Forbidden', { status: 403, headers });
  const { email } = await request.json(); if (!email || typeof email !== 'string') return new Response('Invalid email', { status: 400, headers });
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email); if (error) return new Response(error.message, { status: 400, headers });
  await admin.from('profiles').upsert({ id: data.user.id, email, is_admin: true });
  return Response.json({ ok: true }, { headers });
});
