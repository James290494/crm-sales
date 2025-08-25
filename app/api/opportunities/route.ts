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
    const stage = searchParams.get("stage")
    const search = searchParams.get("search")

    let query = supabase
      .from("opportunities")
      .select(`
        *,
        companies(id, name),
        contacts(id, first_name, last_name),
        leads(id, title)
      `)
      .order("created_at", { ascending: false })

    if (stage) {
      query = query.eq("stage", stage)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: opportunities, error } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ opportunities })
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
      company_id,
      contact_id,
      lead_id,
      name,
      description,
      value,
      stage = "prospecting",
      probability = 10,
      expected_close_date,
      notes,
    } = body

    // Validation
    if (!name || !value) {
      return NextResponse.json({ error: "Opportunity name and value are required" }, { status: 400 })
    }

    const { data: opportunity, error } = await supabase
      .from("opportunities")
      .insert({
        company_id,
        contact_id,
        lead_id,
        name,
        description,
        value,
        stage,
        probability,
        expected_close_date,
        notes,
        assigned_to: user.id,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ opportunity }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
