import { NextResponse } from 'next/server';
import { readDB, addFurnaceRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.furnace });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['date', 'furnace_id', 'heat_no', 'scrap_input_kg', 'runtime_min', 'patching_powder_kg', 'patching_forma_kg', 'liquid_steel_tapped_kg'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const scrapInput = parseFloat(body.scrap_input_kg);
    const runtime = parseInt(body.runtime_min, 10);
    const powder = parseFloat(body.patching_powder_kg);
    const forma = parseFloat(body.patching_forma_kg);
    const tapped = parseFloat(body.liquid_steel_tapped_kg);

    if (isNaN(scrapInput) || isNaN(runtime) || isNaN(powder) || isNaN(forma) || isNaN(tapped)) {
      return NextResponse.json({ success: false, error: 'Numerical fields must be valid numbers.' }, { status: 400 });
    }

    if (scrapInput <= 0 || tapped <= 0) {
      return NextResponse.json({ success: false, error: 'Scrap input and liquid steel tapped must be positive values.' }, { status: 400 });
    }

    // Check unique heat_no
    const db = readDB();
    if (db.furnace.some(f => f.heat_no.toLowerCase() === body.heat_no.toLowerCase())) {
      return NextResponse.json({ success: false, error: `Heat number '${body.heat_no}' already exists.` }, { status: 400 });
    }

    const newRow = addFurnaceRow({
      date: body.date,
      furnace_id: body.furnace_id,
      heat_no: body.heat_no,
      scrap_input_kg: scrapInput,
      runtime_min: runtime,
      patching_powder_kg: powder,
      patching_forma_kg: forma,
      liquid_steel_tapped_kg: tapped
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
