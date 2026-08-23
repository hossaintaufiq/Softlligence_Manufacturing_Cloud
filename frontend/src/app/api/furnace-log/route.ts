import { NextResponse } from 'next/server';
import { readDB, addFurnaceRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.furnace });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const furnace_no = body.furnace_no;
    const heat_no = body.heat_no;
    const scrap_input_kg = parseFloat(body.scrap_input_kg);
    const runtime_min = parseFloat(body.runtime_min);
    const used_patching_powder_kg = parseFloat(body.used_patching_powder_kg);
    const used_patching_forma_kg = parseFloat(body.used_patching_forma_kg);
    const tapping_temp_c = parseFloat(body.tapping_temp_c);
    const liquid_steel_tapped_kg = parseFloat(body.liquid_steel_tapped_kg);
    const power_consumed_kwh = parseFloat(body.power_consumed_kwh);
    const shift_id = body.shift_id;
    const furnace_master = body.furnace_master;

    if (!date || !furnace_no || !heat_no || !shift_id || !furnace_master) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    const db = readDB();
    const isDuplicateHeat = db.furnace.some(f => f.heat_no.toLowerCase() === heat_no.toLowerCase());
    if (isDuplicateHeat) {
      return NextResponse.json({ success: false, error: `Heat Number '${heat_no}' is already logged.` }, { status: 400 });
    }

    if (isNaN(scrap_input_kg) || scrap_input_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Scrap input must be positive.' }, { status: 400 });
    }
    if (isNaN(runtime_min) || runtime_min <= 0) {
      return NextResponse.json({ success: false, error: 'Runtime must be positive.' }, { status: 400 });
    }
    if (isNaN(used_patching_powder_kg) || used_patching_powder_kg < 0) {
      return NextResponse.json({ success: false, error: 'Patching powder cannot be negative.' }, { status: 400 });
    }
    if (isNaN(used_patching_forma_kg) || used_patching_forma_kg < 0) {
      return NextResponse.json({ success: false, error: 'Patching forma count cannot be negative.' }, { status: 400 });
    }
    if (isNaN(tapping_temp_c) || tapping_temp_c <= 0) {
      return NextResponse.json({ success: false, error: 'Tapping temperature must be positive.' }, { status: 400 });
    }
    if (isNaN(liquid_steel_tapped_kg) || liquid_steel_tapped_kg <= 0) {
      return NextResponse.json({ success: false, error: 'Tapped steel weight must be positive.' }, { status: 400 });
    }
    if (isNaN(power_consumed_kwh) || power_consumed_kwh <= 0) {
      return NextResponse.json({ success: false, error: 'Power consumed must be positive.' }, { status: 400 });
    }

    const newRow = addFurnaceRow({
      date,
      furnace_no,
      heat_no,
      scrap_input_kg,
      runtime_min,
      used_patching_powder_kg,
      used_patching_forma_kg,
      tapping_temp_c,
      liquid_steel_tapped_kg,
      power_consumed_kwh,
      shift_id,
      furnace_master
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
