import { NextResponse } from 'next/server';
import { readDB, addExpenseRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['date', 'category', 'voucher_no', 'description', 'amount', 'type'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const amt = parseFloat(body.amount);
    if (isNaN(amt) || amt <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be a positive number.' }, { status: 400 });
    }

    const validTypes = ['Expense', 'Scrap Payable', 'Customer Receivable'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    // Check unique voucher_no
    const db = readDB();
    if (db.expenses.some(e => e.voucher_no.toLowerCase() === body.voucher_no.toLowerCase())) {
      return NextResponse.json({ success: false, error: `Voucher number '${body.voucher_no}' already exists.` }, { status: 400 });
    }

    const newRow = addExpenseRow({
      date: body.date,
      category: body.category,
      voucher_no: body.voucher_no,
      description: body.description,
      amount: amt,
      type: body.type as any
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
