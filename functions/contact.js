export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, company, sector, service, message, company_website_url_check } = data;

    // 1. Honeypot check
    if (company_website_url_check) {
      return new Response(JSON.stringify({ success: false, message: 'Spam detected.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Validation
    if (!name || !email || !company || !sector || !service || !message) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Cloudflare Worker] Received scoping request from ${name} (${email}) for company ${company}`);

    // In production, you would push this payload to Zoho/HubSpot webhook:
    // await fetch(context.env.ZOHO_WEBHOOK, { method: 'POST', body: JSON.stringify(data) });

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
