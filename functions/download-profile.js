export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const email = url.searchParams.get('email');

  console.log(`[Cloudflare Worker] Profile brochure downloaded. Email logged: ${email || 'Anonymous'}`);

  // Redirect to PDF file
  return Response.redirect('https://enconsta.com/public/team/raghavan-cv.pdf', 302);
}
