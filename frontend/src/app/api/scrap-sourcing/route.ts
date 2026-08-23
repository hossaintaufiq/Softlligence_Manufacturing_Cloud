import { NextResponse } from 'next/server';
import { readDB, addScrapRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.scrap });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Field validations
    const date = body.date;
    const supplier_name = body.supplier_name;
    const scrap_category = body.scrap_category;
    const scrap_rcv_kg = parseFloat(body.scrap_rcv_kg);
    const truck_no = body.truck_no;
    const gross_weight = parseFloat(body.gross_weight);
    const value_tare = parseFloat(body.value_tare);
    const rate_per_kg = parseFloat(body.rate_per_kg);
    const yard_location = body.yard_location;

    if (!date || !supplier_name || !scrap_category || !truck_no || !yard_location) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }
    if (isNaN(scrap_rcv_kg) || scrap_rcv_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Scrap weight must be positive.' }, { status: 400 });
    }
    if (isNaN(gross_weight) || gross_weight <= 0) {
      return NextResponse.json({ success: false, error: 'Gross weight must be positive.' }, { status: 400 });
    }
    if (isNaN(value_tare) || value_tare < 0) {
      return NextResponse.json({ success: false, error: 'Tare weight must be non-negative.' }, { status: 400 });
    }
    if (gross_weight <= value_tare) {
      return NextResponse.json({ success: false, error: 'Gross weight must exceed Tare weight.' }, { status: 400 });
    }
    if (isNaN(rate_per_kg) || rate_per_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Rate must be positive.' }, { status: 400 });
    }

    const newRow = addScrapRow({
      date,
      supplier_name,
      scrap_category,
      scrap_rcv_kg,
      truck_no,
      gross_weight,
      value_tare,
      rate_per_kg,
      yard_location
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
