export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, company, date, time } = data;

    if (!name || !email || !company) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Cloudflare Worker] Scoping consultation scheduled for ${name} at ${date} ${time}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
