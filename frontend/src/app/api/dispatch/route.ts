import { NextResponse } from 'next/server';
import { readDB, addDispatchRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.dispatch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['date', 'customer_name', 'challan_no', 'rod_size', 'dispatch_qty_kg', 'rate_per_kg', 'truck_no', 'contact_info'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const qty = parseFloat(body.dispatch_qty_kg);
    const rate = parseFloat(body.rate_per_kg);

    if (isNaN(qty) || isNaN(rate)) {
      return NextResponse.json({ success: false, error: 'Quantity and rate must be valid numbers.' }, { status: 400 });
    }

    const validSizes = ['10mm', '12mm', '16mm', '20mm', '25mm', '32mm'];
    if (!validSizes.includes(body.rod_size)) {
      return NextResponse.json({ success: false, error: `Invalid rod size. Must be one of: ${validSizes.join(', ')}` }, { status: 400 });
    }

    // Check unique challan_no
    const db = readDB();
    if (db.dispatch.some(d => d.challan_no.toLowerCase() === body.challan_no.toLowerCase())) {
      return NextResponse.json({ success: false, error: `Challan number '${body.challan_no}' already exists.` }, { status: 400 });
    }

    const newRow = addDispatchRow({
      date: body.date,
      customer_name: body.customer_name,
      challan_no: body.challan_no,
      rod_size: body.rod_size,
      dispatch_qty_kg: qty,
      rate_per_kg: rate,
      truck_no: body.truck_no,
      contact_info: body.contact_info
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
