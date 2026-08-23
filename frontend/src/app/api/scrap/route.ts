import { NextResponse } from 'next/server';
import { readDB, addScrapRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.scrap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Field validations
    const requiredFields = ['date', 'supplier_name', 'scrap_category', 'truck_no', 'gross_weight', 'tare_weight', 'rate_per_kg'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const gross = parseFloat(body.gross_weight);
    const tare = parseFloat(body.tare_weight);
    const rate = parseFloat(body.rate_per_kg);

    if (isNaN(gross) || isNaN(tare) || isNaN(rate)) {
      return NextResponse.json({ success: false, error: 'Weights and rates must be valid numbers.' }, { status: 400 });
    }

    if (gross <= tare) {
      return NextResponse.json({ success: false, error: 'Gross weight must be greater than tare weight.' }, { status: 400 });
    }

    const newRow = addScrapRow({
      date: body.date,
      supplier_name: body.supplier_name,
      scrap_category: body.scrap_category,
      truck_no: body.truck_no,
      gross_weight: gross,
      tare_weight: tare,
      rate_per_kg: rate
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
