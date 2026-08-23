import { NextResponse } from 'next/server';
import { readDB, addExpenseRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.expenses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const expenses = parseFloat(body.expenses);
    const category = body.category;
    const voucher_no = body.voucher_no;
    const payment_method = body.payment_method;
    const remarks = body.remarks;

    if (!date || !category || !voucher_no || !payment_method || !remarks) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    const db = readDB();
    const isDuplicateVoucher = db.expenses.some(e => e.voucher_no.toLowerCase() === voucher_no.toLowerCase());
    if (isDuplicateVoucher) {
      return NextResponse.json({ success: false, error: `Voucher Number '${voucher_no}' already logged.` }, { status: 400 });
    }

    if (isNaN(expenses) || expenses <= 0) {
      return NextResponse.json({ success: false, error: 'Expenses must be positive.' }, { status: 400 });
    }

    const newRow = addExpenseRow({
      date,
      expenses,
      category,
      voucher_no,
      payment_method,
      remarks
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
