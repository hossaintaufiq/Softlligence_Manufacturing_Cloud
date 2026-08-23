import { NextResponse } from 'next/server';
import { readDB, addQualityRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.quality });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const heat_no = body.heat_no;
    const testing_date = body.testing_date;
    const pct_c = parseFloat(body.pct_c);
    const pct_mn = parseFloat(body.pct_mn);
    const pct_si = parseFloat(body.pct_si);
    const pct_s = parseFloat(body.pct_s);
    const pct_p = parseFloat(body.pct_p);
    const yield_strength_n_mm2 = parseFloat(body.yield_strength_n_mm2);
    const tensile_strength_n_mm2 = parseFloat(body.tensile_strength_n_mm2);
    const elongation_pct = parseFloat(body.elongation_pct);
    const bend_test_result = body.bend_test_result;
    const nominal_mass_g_m = parseFloat(body.nominal_mass_g_m);

    if (!heat_no || !testing_date || !bend_test_result) {
      return NextResponse.json({ success: false, error: 'Required fields missing.' }, { status: 400 });
    }

    const db = readDB();
    const isDuplicateQuality = db.quality.some(q => q.heat_no.toLowerCase() === heat_no.toLowerCase());
    if (isDuplicateQuality) {
      return NextResponse.json({ success: false, error: `Spectrometry report already logged for Heat No '${heat_no}'.` }, { status: 400 });
    }

    if (isNaN(pct_c) || pct_c < 0 || pct_c > 100) return NextResponse.json({ success: false, error: 'Carbon % must be 0-100.' }, { status: 400 });
    if (isNaN(pct_mn) || pct_mn < 0 || pct_mn > 100) return NextResponse.json({ success: false, error: 'Manganese % must be 0-100.' }, { status: 400 });
    if (isNaN(pct_si) || pct_si < 0 || pct_si > 100) return NextResponse.json({ success: false, error: 'Silicon % must be 0-100.' }, { status: 400 });
    if (isNaN(pct_s) || pct_s < 0 || pct_s > 100) return NextResponse.json({ success: false, error: 'Sulfur % must be 0-100.' }, { status: 400 });
    if (isNaN(pct_p) || pct_p < 0 || pct_p > 100) return NextResponse.json({ success: false, error: 'Phosphorous % must be 0-100.' }, { status: 400 });
    
    if (isNaN(yield_strength_n_mm2) || yield_strength_n_mm2 <= 0) return NextResponse.json({ success: false, error: 'Yield strength must be positive.' }, { status: 400 });
    if (isNaN(tensile_strength_n_mm2) || tensile_strength_n_mm2 <= 0) return NextResponse.json({ success: false, error: 'Tensile strength must be positive.' }, { status: 400 });
    if (yield_strength_n_mm2 >= tensile_strength_n_mm2) return NextResponse.json({ success: false, error: 'Tensile strength must exceed Yield strength.' }, { status: 400 });
    if (isNaN(elongation_pct) || elongation_pct < 0 || elongation_pct > 100) return NextResponse.json({ success: false, error: 'Elongation % must be 0-100.' }, { status: 400 });
    if (isNaN(nominal_mass_g_m) || nominal_mass_g_m <= 0) return NextResponse.json({ success: false, error: 'Nominal mass must be positive.' }, { status: 400 });

    const newRow = addQualityRow({
      heat_no,
      testing_date,
      pct_c,
      pct_mn,
      pct_si,
      pct_s,
      pct_p,
      yield_strength_n_mm2,
      tensile_strength_n_mm2,
      elongation_pct,
      bend_test_result,
      nominal_mass_g_m
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
