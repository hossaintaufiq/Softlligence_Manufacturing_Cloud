import { NextResponse } from 'next/server';
import { readDB, addWeighbridgeRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.weighbridge });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['ticket_no', 'date', 'vehicle_no', 'material_type', 'gross_weight_kg', 'tare_weight_kg', 'status'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const gross = parseFloat(body.gross_weight_kg);
    const tare = parseFloat(body.tare_weight_kg);

    if (isNaN(gross) || isNaN(tare)) {
      return NextResponse.json({ success: false, error: 'Gross and tare weights must be valid numbers.' }, { status: 400 });
    }

    if (gross < tare) {
      return NextResponse.json({ success: false, error: 'Gross weight cannot be less than tare weight.' }, { status: 400 });
    }

    const validStatus = ['Pending', 'Completed'];
    if (!validStatus.includes(body.status)) {
      return NextResponse.json({ success: false, error: 'Invalid status. Must be Pending or Completed' }, { status: 400 });
    }

    // Check unique ticket_no
    const db = readDB();
    if (db.weighbridge.some(w => w.ticket_no.toLowerCase() === body.ticket_no.toLowerCase())) {
      return NextResponse.json({ success: false, error: `Weighbridge ticket '${body.ticket_no}' already exists.` }, { status: 400 });
    }

    const newRow = addWeighbridgeRow({
      ticket_no: body.ticket_no,
      date: body.date,
      vehicle_no: body.vehicle_no,
      material_type: body.material_type,
      gross_weight_kg: gross,
      tare_weight_kg: tare,
      status: body.status
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
