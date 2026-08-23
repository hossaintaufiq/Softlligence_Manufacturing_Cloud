import { NextResponse } from 'next/server';
import { readDB, addQualityRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.quality });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      'heat_no', 'test_date', 'pct_c', 'pct_mn', 'pct_si', 'pct_s', 'pct_p',
      'yield_strength_n_mm2', 'tensile_strength_n_mm2', 'elongation_pct', 'bend_test_status'
    ];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const c = parseFloat(body.pct_c);
    const mn = parseFloat(body.pct_mn);
    const si = parseFloat(body.pct_si);
    const s = parseFloat(body.pct_s);
    const p = parseFloat(body.pct_p);
    const ys = parseFloat(body.yield_strength_n_mm2);
    const ts = parseFloat(body.tensile_strength_n_mm2);
    const el = parseFloat(body.elongation_pct);

    if (isNaN(c) || isNaN(mn) || isNaN(si) || isNaN(s) || isNaN(p) || isNaN(ys) || isNaN(ts) || isNaN(el)) {
      return NextResponse.json({ success: false, error: 'Chemical values and strength values must be valid numbers.' }, { status: 400 });
    }

    const validBend = ['Approved', 'Rejected'];
    if (!validBend.includes(body.bend_test_status)) {
      return NextResponse.json({ success: false, error: 'Bend test status must be Approved or Rejected' }, { status: 400 });
    }

    const db = readDB();
    
    // Check if heat_no exists in furnace table
    const heatExists = db.furnace.some(f => f.heat_no.toLowerCase() === body.heat_no.toLowerCase());
    if (!heatExists) {
      return NextResponse.json({ success: false, error: `Heat number '${body.heat_no}' does not exist in furnace logs. Please log furnace heat cycle first.` }, { status: 400 });
    }

    // Check unique heat_no in quality table
    if (db.quality.some(q => q.heat_no.toLowerCase() === body.heat_no.toLowerCase())) {
      return NextResponse.json({ success: false, error: `Quality report for heat number '${body.heat_no}' already exists.` }, { status: 400 });
    }

    const newRow = addQualityRow({
      heat_no: body.heat_no,
      test_date: body.test_date,
      pct_c: c,
      pct_mn: mn,
      pct_si: si,
      pct_s: s,
      pct_p: p,
      yield_strength_n_mm2: ys,
      tensile_strength_n_mm2: ts,
      elongation_pct: el,
      bend_test_status: body.bend_test_status
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
