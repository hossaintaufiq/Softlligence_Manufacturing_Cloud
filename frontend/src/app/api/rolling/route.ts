import { NextResponse } from 'next/server';
import { readDB, addRollingRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.rolling });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['date', 'billet_input_kg', 'rod_size', 'rod_production_kg', 'burning_loss_kg', 'end_cut_loss_kg', 'miss_roll_kg'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const input = parseFloat(body.billet_input_kg);
    const prod = parseFloat(body.rod_production_kg);
    const burning = parseFloat(body.burning_loss_kg);
    const endCut = parseFloat(body.end_cut_loss_kg);
    const missRoll = parseFloat(body.miss_roll_kg);

    if (isNaN(input) || isNaN(prod) || isNaN(burning) || isNaN(endCut) || isNaN(missRoll)) {
      return NextResponse.json({ success: false, error: 'Numerical fields must be valid numbers.' }, { status: 400 });
    }

    const validSizes = ['10mm', '12mm', '16mm', '20mm', '25mm', '32mm'];
    if (!validSizes.includes(body.rod_size)) {
      return NextResponse.json({ success: false, error: `Invalid rod size. Must be one of: ${validSizes.join(', ')}` }, { status: 400 });
    }

    const newRow = addRollingRow({
      date: body.date,
      billet_input_kg: input,
      rod_size: body.rod_size,
      rod_production_kg: prod,
      burning_loss_kg: burning,
      end_cut_loss_kg: endCut,
      miss_roll_kg: missRoll
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
