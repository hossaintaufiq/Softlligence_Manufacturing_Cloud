import { NextResponse } from 'next/server';
import { readDB, addBilletRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.billet });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['heat_no', 'billet_size_section', 'billet_output_kg', 'scull_loss_kg'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const output = parseFloat(body.billet_output_kg);
    const scull = parseFloat(body.scull_loss_kg);

    if (isNaN(output) || isNaN(scull)) {
      return NextResponse.json({ success: false, error: 'Billet output and scull loss must be valid numbers.' }, { status: 400 });
    }

    const db = readDB();
    
    // Check if heat_no exists in furnace table
    const heatExists = db.furnace.some(f => f.heat_no.toLowerCase() === body.heat_no.toLowerCase());
    if (!heatExists) {
      return NextResponse.json({ success: false, error: `Heat number '${body.heat_no}' does not exist in furnace logs. Please log the furnace heat cycle first.` }, { status: 400 });
    }

    // Check if billet run is already logged for this heat
    const billetExists = db.billet.some(b => b.heat_no.toLowerCase() === body.heat_no.toLowerCase());
    if (billetExists) {
      return NextResponse.json({ success: false, error: `Billet casting is already logged for Heat number '${body.heat_no}'.` }, { status: 400 });
    }

    const newRow = addBilletRow({
      heat_no: body.heat_no,
      billet_size_section: body.billet_size_section,
      billet_output_kg: output,
      scull_loss_kg: scull
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
