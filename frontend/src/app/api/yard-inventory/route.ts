import { NextResponse } from 'next/server';
import { readDB, updateInventory } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.inventory });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const raw_scrap_mt = parseFloat(body.raw_scrap_mt);
    const billet_yard_mt = parseFloat(body.billet_yard_mt);
    const rebar_10mm_mt = parseFloat(body.rebar_10mm_mt);
    const rebar_12mm_mt = parseFloat(body.rebar_12mm_mt);
    const rebar_16mm_mt = parseFloat(body.rebar_16mm_mt);
    const rebar_20mm_mt = parseFloat(body.rebar_20mm_mt);
    const rebar_25mm_mt = parseFloat(body.rebar_25mm_mt);
    const rebar_32mm_mt = parseFloat(body.rebar_32mm_mt);
    const store_patching_powder_kg = parseFloat(body.store_patching_powder_kg);
    const store_patching_forma_qty = parseFloat(body.store_patching_forma_qty);
    const store_rolls_qty = parseFloat(body.store_rolls_qty);
    const store_guides_qty = parseFloat(body.store_guides_qty);

    if (
      isNaN(raw_scrap_mt) || raw_scrap_mt < 0 ||
      isNaN(billet_yard_mt) || billet_yard_mt < 0 ||
      isNaN(rebar_10mm_mt) || rebar_10mm_mt < 0 ||
      isNaN(rebar_12mm_mt) || rebar_12mm_mt < 0 ||
      isNaN(rebar_16mm_mt) || rebar_16mm_mt < 0 ||
      isNaN(rebar_20mm_mt) || rebar_20mm_mt < 0 ||
      isNaN(rebar_25mm_mt) || rebar_25mm_mt < 0 ||
      isNaN(rebar_32mm_mt) || rebar_32mm_mt < 0 ||
      isNaN(store_patching_powder_kg) || store_patching_powder_kg < 0 ||
      isNaN(store_patching_forma_qty) || store_patching_forma_qty < 0 ||
      isNaN(store_rolls_qty) || store_rolls_qty < 0 ||
      isNaN(store_guides_qty) || store_guides_qty < 0
    ) {
      return NextResponse.json({ success: false, error: 'Inventory stock levels must be positive numbers.' }, { status: 400 });
    }

    const updated = updateInventory({
      raw_scrap_mt,
      billet_yard_mt,
      rebar_10mm_mt,
      rebar_12mm_mt,
      rebar_16mm_mt,
      rebar_20mm_mt,
      rebar_25mm_mt,
      rebar_32mm_mt,
      store_patching_powder_kg,
      store_patching_forma_qty,
      store_rolls_qty,
      store_guides_qty
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 550 });
  }
}
