import { NextResponse } from 'next/server';
import { readDB, addDowntimeRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.downtime });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const billet_breakdown_min = parseFloat(body.billet_breakdown_min);
    const rolling_breakdown_min = parseFloat(body.rolling_breakdown_min);
    const breakdown_category = body.breakdown_category;
    const root_cause_notes = body.root_cause_notes;
    const shift_code = body.shift_code;
    const action_taken = body.action_taken;

    if (!date || !breakdown_category || !root_cause_notes || !shift_code || !action_taken) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    if (isNaN(billet_breakdown_min) || billet_breakdown_min < 0) {
      return NextResponse.json({ success: false, error: 'Billet breakdown must be non-negative.' }, { status: 400 });
    }
    if (isNaN(rolling_breakdown_min) || rolling_breakdown_min < 0) {
      return NextResponse.json({ success: false, error: 'Rolling breakdown must be non-negative.' }, { status: 400 });
    }

    const newRow = addDowntimeRow({
      date,
      billet_breakdown_min,
      rolling_breakdown_min,
      breakdown_category,
      root_cause_notes,
      shift_code,
      action_taken
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
