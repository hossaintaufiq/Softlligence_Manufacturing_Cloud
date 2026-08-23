import { NextResponse } from 'next/server';
import { readDB, addShiftRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.shifts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['date', 'shift', 'furnace_master', 'roll_turner', 'operators_present', 'attendance_log'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const present = parseInt(body.operators_present, 10);
    if (isNaN(present) || present < 0) {
      return NextResponse.json({ success: false, error: 'Operators present must be a non-negative integer.' }, { status: 400 });
    }

    const validShifts = ['Shift A', 'Shift B', 'Shift C'];
    if (!validShifts.includes(body.shift)) {
      return NextResponse.json({ success: false, error: `Invalid shift. Must be one of: ${validShifts.join(', ')}` }, { status: 400 });
    }

    const newRow = addShiftRow({
      date: body.date,
      shift: body.shift as any,
      furnace_master: body.furnace_master,
      roll_turner: body.roll_turner,
      operators_present: present,
      attendance_log: body.attendance_log
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
