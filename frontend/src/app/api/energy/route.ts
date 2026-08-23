import { NextResponse } from 'next/server';
import { readDB, addEnergyRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.energy });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['date', 'meter_reading_kw', 'power_consumed_kwh', 'gas_consumed_nm3'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const reading = parseFloat(body.meter_reading_kw);
    const power = parseFloat(body.power_consumed_kwh);
    const gas = parseFloat(body.gas_consumed_nm3);

    if (isNaN(reading) || isNaN(power) || isNaN(gas)) {
      return NextResponse.json({ success: false, error: 'Meter readings, power and gas quantities must be valid numbers.' }, { status: 400 });
    }

    const newRow = addEnergyRow({
      date: body.date,
      meter_reading_kw: reading,
      power_consumed_kwh: power,
      gas_consumed_nm3: gas
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
