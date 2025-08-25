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
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = supabase
      .from("quotations")
      .select(`
        *,
        companies(id, name),
        contacts(id, first_name, last_name),
        opportunities(id, name)
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,quote_number.ilike.%${search}%`)
    }

    const { data: quotations, error } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ quotations })
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
      opportunity_id,
      title,
      description,
      tax_rate = 0,
      discount_rate = 0,
      valid_until,
      terms_conditions,
      notes,
      items = [],
    } = body

    // Validation
    if (!title || !company_id) {
      return NextResponse.json({ error: "Title and company are required" }, { status: 400 })
    }

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .insert({
        company_id,
        contact_id,
        opportunity_id,
        title,
        description,
        tax_rate,
        discount_rate,
        valid_until,
        terms_conditions,
        notes,
        created_by: user.id,
      })
      .select()
      .single()

    if (quotationError) {
      return NextResponse.json({ error: quotationError.message }, { status: 500 })
    }

    // Add quotation items if provided
    if (items.length > 0) {
      const quotationItems = items.map((item: any, index: number) => ({
        quotation_id: quotation.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_rate: item.discount_rate || 0,
        line_total: item.quantity * item.unit_price * (1 - (item.discount_rate || 0) / 100),
        sort_order: index,
      }))

      const { error: itemsError } = await supabase.from("quotation_items").insert(quotationItems)

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ quotation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
