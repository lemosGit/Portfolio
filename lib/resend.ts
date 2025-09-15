import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, subject, message } = await req.json();

    const data = await resend.emails.send({
      from: "Convites <lemos.trabalho.7@gmail.com>", // precisa ser domínio verificado no Resend
      to: email,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}

