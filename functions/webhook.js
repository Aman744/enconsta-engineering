export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    
    console.log('[Cloudflare Worker] Dispatching Webhook payload to Zoho CRM...');
    
    // In production:
    // const res = await fetch(context.env.CRM_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    
    return new Response(JSON.stringify({ success: true, dispatched: true }), {
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
