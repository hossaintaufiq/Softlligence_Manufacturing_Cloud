import { NextResponse } from 'next/server';
import { readDB, addDispatchRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.dispatch });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const customer_name = body.customer_name;
    const contact_info = body.contact_info;
    const challan_no = body.challan_no;
    const rod_size = body.rod_size;
    const dispatch_qty_kg = parseFloat(body.dispatch_qty_kg);
    const rate_per_kg = parseFloat(body.rate_per_kg);
    const truck_details = body.truck_details;
    const payment_terms = body.payment_terms;
    const delivery_status = body.delivery_status;

    if (!date || !customer_name || !contact_info || !challan_no || !rod_size || !truck_details || !payment_terms || !delivery_status) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    const db = readDB();
    const isDuplicateChallan = db.dispatch.some(d => d.challan_no.toLowerCase() === challan_no.toLowerCase());
    if (isDuplicateChallan) {
      return NextResponse.json({ success: false, error: `Challan Number '${challan_no}' is already in use.` }, { status: 400 });
    }

    if (isNaN(dispatch_qty_kg) || dispatch_qty_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Dispatch quantity must be positive.' }, { status: 400 });
    }
    if (isNaN(rate_per_kg) || rate_per_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Rate must be positive.' }, { status: 400 });
    }

    const newRow = addDispatchRow({
      date,
      customer_name,
      contact_info,
      challan_no,
      rod_size,
      dispatch_qty_kg,
      rate_per_kg,
      truck_details,
      payment_terms,
      delivery_status
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
