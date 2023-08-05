export async function POST(request: Request) {
  const { userName, password } = await request.json();

  if (userName === "admin" && password == "admin") {
    return new Response(JSON.stringify({ userName: userName }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ message: "Nom ou mot de passe invalide." }), { status: 401 });
  }
}
