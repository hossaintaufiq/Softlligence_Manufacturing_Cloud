import { NextResponse } from 'next/server';
import { readDB, updateInventory } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.inventory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      'raw_scrap_mt', 'billet_yard_mt',
      'rebar_10mm_mt', 'rebar_12mm_mt', 'rebar_16mm_mt', 'rebar_20mm_mt', 'rebar_25mm_mt', 'rebar_32mm_mt',
      'store_spares_qty'
    ];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const rawScrap = parseFloat(body.raw_scrap_mt);
    const billetYard = parseFloat(body.billet_yard_mt);
    const r10 = parseFloat(body.rebar_10mm_mt);
    const r12 = parseFloat(body.rebar_12mm_mt);
    const r16 = parseFloat(body.rebar_16mm_mt);
    const r20 = parseFloat(body.rebar_20mm_mt);
    const r25 = parseFloat(body.rebar_25mm_mt);
    const r32 = parseFloat(body.rebar_32mm_mt);
    const spares = parseInt(body.store_spares_qty, 10);

    if (
      isNaN(rawScrap) || isNaN(billetYard) ||
      isNaN(r10) || isNaN(r12) || isNaN(r16) || isNaN(r20) || isNaN(r25) || isNaN(r32) ||
      isNaN(spares)
    ) {
      return NextResponse.json({ success: false, error: 'Inventory values must be valid numbers.' }, { status: 400 });
    }

    const updated = updateInventory({
      raw_scrap_mt: rawScrap,
      billet_yard_mt: billetYard,
      rebar_10mm_mt: r10,
      rebar_12mm_mt: r12,
      rebar_16mm_mt: r16,
      rebar_20mm_mt: r20,
      rebar_25mm_mt: r25,
      rebar_32mm_mt: r32,
      store_spares_qty: spares
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
