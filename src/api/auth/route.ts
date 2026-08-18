// Next.js API Route for Authentication & User Session Management
// Endpoint: /api/auth

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, fullName, businessName } = body;

    if (action === 'signup') {
      // Create user & vendor in PostgreSQL / Supabase
      return Response.json({
        success: true,
        user: {
          id: 'usr_' + Date.now(),
          email,
          fullName,
          businessName: businessName || 'Vendor Business',
        },
        token: 'jwt_mock_token_' + Date.now(),
      });
    }

    if (action === 'login') {
      return Response.json({
        success: true,
        user: {
          id: 'usr_demo',
          email,
          fullName: 'Aarav Sharma',
          businessName: 'Royal Moments Photography',
        },
        token: 'jwt_mock_token_demo',
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
