import { supabase } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // ambil user dari supabase
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error || !users || users.length === 0) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  const user = users[0];

  // cek role admin
  if (user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Access denied" }), {
      status: 403,
    });
  }

  // verifikasi password
  const isMatch = bcrypt.compareSync(password, user.password_hash);

  if (!isMatch) {
    return new Response(JSON.stringify({ message: "Password Salah" }), {
      status: 400,
    });
  }

  // sukses
  return Response.json({
    message: "Login Berhasil",
    user,
  });
}
