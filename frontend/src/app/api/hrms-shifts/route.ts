import { NextResponse } from 'next/server';
import { readDB, addShiftRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.shifts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const shift_id = body.shift_id;
    const shift_supervisor = body.shift_supervisor;
    const furnace_tapper_melters = body.furnace_tapper_melters;
    const ccm_operators = body.ccm_operators;
    const roll_turners_feeders = body.roll_turners_feeders;
    const total_crew_strength = parseFloat(body.total_crew_strength);
    const shift_output_mt = parseFloat(body.shift_output_mt);

    if (!date || !shift_id || !shift_supervisor || !furnace_tapper_melters || !ccm_operators || !roll_turners_feeders) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    if (isNaN(total_crew_strength) || total_crew_strength < 0) {
      return NextResponse.json({ success: false, error: 'Total crew strength must be non-negative.' }, { status: 400 });
    }
    if (isNaN(shift_output_mt) || shift_output_mt < 0) {
      return NextResponse.json({ success: false, error: 'Shift output must be non-negative.' }, { status: 400 });
    }

    const newRow = addShiftRow({
      date,
      shift_id,
      shift_supervisor,
      furnace_tapper_melters,
      ccm_operators,
      roll_turners_feeders,
      total_crew_strength,
      shift_output_mt
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
