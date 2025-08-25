import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")
    const entity_type = searchParams.get("entity_type")
    const entity_id = searchParams.get("entity_id")

    let query = supabase
      .from("activities")
      .select(`
        *,
        companies(id, name),
        contacts(id, first_name, last_name),
        leads(id, title),
        opportunities(id, name)
      `)
      .order("activity_date", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    if (entity_type) {
      query = query.eq("entity_type", entity_type)
    }

    if (entity_id) {
      query = query.eq("entity_id", entity_id)
    }

    const { data: activities, error } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ activities })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      entity_type,
      entity_id,
      type,
      subject,
      description,
      activity_date,
      duration_minutes,
      outcome,
      follow_up_date,
    } = body

    // Validation
    if (!entity_type || !entity_id || !type || !subject) {
      return NextResponse.json(
        { error: "Entity type, entity ID, activity type, and subject are required" },
        { status: 400 },
      )
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .insert({
        entity_type,
        entity_id,
        type,
        subject,
        description,
        activity_date: activity_date || new Date().toISOString(),
        duration_minutes,
        outcome,
        follow_up_date,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
