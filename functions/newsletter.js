export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { email } = data;

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: 'Email required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Cloudflare Worker] Newsletter subscription logged: ${email}`);

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
