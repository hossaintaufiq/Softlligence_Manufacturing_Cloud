import { NextResponse } from 'next/server';
import { readDB, addBilletRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.billet });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const billet_size_section = body.billet_size_section;
    const billet_output_kg = parseFloat(body.billet_output_kg);
    const heat_no = body.heat_no;

    if (!date || !billet_size_section || !heat_no) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    const db = readDB();
    const isDuplicateBillet = db.billet.some(b => b.heat_no.toLowerCase() === heat_no.toLowerCase());
    if (isDuplicateBillet) {
      return NextResponse.json({ success: false, error: `Billet casting is already logged for Heat No '${heat_no}'.` }, { status: 400 });
    }

    const furnaceHeat = db.furnace.find(f => f.heat_no.toLowerCase() === heat_no.toLowerCase());
    if (!furnaceHeat) {
      return NextResponse.json({ success: false, error: `Furnace log with Heat Number '${heat_no}' does not exist.` }, { status: 400 });
    }

    if (isNaN(billet_output_kg) || billet_output_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Billet output must be positive.' }, { status: 400 });
    }

    const newRow = addBilletRow({
      date,
      billet_size_section,
      billet_output_kg,
      heat_no
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
