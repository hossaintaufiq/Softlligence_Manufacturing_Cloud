import { NextResponse } from 'next/server';
import { readDB, addRollingRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.rolling });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const billet_input_kg = parseFloat(body.billet_input_kg);
    const rod_size = body.rod_size;
    const rod_production_kg = parseFloat(body.rod_production_kg);

    if (!date || !rod_size) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    if (isNaN(billet_input_kg) || billet_input_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Billet input must be positive.' }, { status: 400 });
    }
    if (isNaN(rod_production_kg) || rod_production_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Rod production must be positive.' }, { status: 400 });
    }
    if (billet_input_kg < rod_production_kg) {
      return NextResponse.json({ success: false, error: 'Billet input must exceed Rod production.' }, { status: 400 });
    }

    const newRow = addRollingRow({
      date,
      billet_input_kg,
      rod_size,
      rod_production_kg
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
