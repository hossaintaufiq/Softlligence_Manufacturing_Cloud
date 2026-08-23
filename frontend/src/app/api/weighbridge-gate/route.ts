import { NextResponse } from 'next/server';
import { readDB, addWeighbridgeRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.weighbridge });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ticket_no = body.ticket_no;
    const date_time = body.date_time;
    const vehicle_no = body.vehicle_no;
    const party_name = body.party_name;
    const material_type = body.material_type;
    const gross_weight_kg = parseFloat(body.gross_weight_kg);
    const tare_weight_kg = parseFloat(body.tare_weight_kg);
    const operator_signature = body.operator_signature;

    if (!ticket_no || !date_time || !vehicle_no || !party_name || !material_type || !operator_signature) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    const db = readDB();
    const isDuplicateTicket = db.weighbridge.some(w => w.ticket_no.toLowerCase() === ticket_no.toLowerCase());
    if (isDuplicateTicket) {
      return NextResponse.json({ success: false, error: `Ticket Number '${ticket_no}' already exists.` }, { status: 400 });
    }

    if (isNaN(gross_weight_kg) || gross_weight_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Gross weight must be positive.' }, { status: 400 });
    }
    if (isNaN(tare_weight_kg) || tare_weight_kg < 0) {
      return NextResponse.json({ success: false, error: 'Tare weight must be non-negative.' }, { status: 400 });
    }
    if (gross_weight_kg <= tare_weight_kg) {
      return NextResponse.json({ success: false, error: 'Gross weight must exceed Tare weight.' }, { status: 400 });
    }

    const newRow = addWeighbridgeRow({
      ticket_no,
      date_time,
      vehicle_no,
      party_name,
      material_type,
      gross_weight_kg,
      tare_weight_kg,
      operator_signature
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
