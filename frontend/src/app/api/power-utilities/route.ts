import { NextResponse } from 'next/server';
import { readDB, addEnergyRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.energy });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = body.date;
    const power_consumption_kw = parseFloat(body.power_consumption_kw);
    const gas_consumption_nm3 = parseFloat(body.gas_consumption_nm3);
    const peak_demand_kva = parseFloat(body.peak_demand_kva);

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date is required.' }, { status: 400 });
    }

    if (isNaN(power_consumption_kw) || power_consumption_kw <= 0) {
      return NextResponse.json({ success: false, error: 'Power consumption must be positive.' }, { status: 400 });
    }
    if (isNaN(gas_consumption_nm3) || gas_consumption_nm3 <= 0) {
      return NextResponse.json({ success: false, error: 'Gas consumption must be positive.' }, { status: 400 });
    }
    if (isNaN(peak_demand_kva) || peak_demand_kva <= 0) {
      return NextResponse.json({ success: false, error: 'Peak demand must be positive.' }, { status: 400 });
    }

    const newRow = addEnergyRow({
      date,
      power_consumption_kw,
      gas_consumption_nm3,
      peak_demand_kva
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
