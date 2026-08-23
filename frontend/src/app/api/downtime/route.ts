import { NextResponse } from 'next/server';
import { readDB, addDowntimeRow } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.downtime });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['date', 'section', 'breakdown_category', 'duration_min', 'root_cause_notes', 'resolved_by'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const duration = parseInt(body.duration_min, 10);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json({ success: false, error: 'Duration must be a positive integer.' }, { status: 400 });
    }

    const validSections = ['BILLET_LINE', 'ROLLING_LINE'];
    if (!validSections.includes(body.section)) {
      return NextResponse.json({ success: false, error: 'Invalid section. Must be BILLET_LINE or ROLLING_LINE' }, { status: 400 });
    }

    const validCategories = ['Mechanical', 'Electrical', 'Roll Change', 'Power Outage'];
    if (!validCategories.includes(body.breakdown_category)) {
      return NextResponse.json({ success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
    }

    const newRow = addDowntimeRow({
      date: body.date,
      section: body.section,
      breakdown_category: body.breakdown_category,
      duration_min: duration,
      root_cause_notes: body.root_cause_notes,
      resolved_by: body.resolved_by
    });

    return NextResponse.json({ success: true, data: newRow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
