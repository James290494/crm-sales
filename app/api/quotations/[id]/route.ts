import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: quotation, error } = await supabase
      .from("quotations")
      .select(`
        *,
        companies(id, name, email, phone, address),
        contacts(id, first_name, last_name, email, phone),
        opportunities(id, name, value),
        quotation_items(
          id,
          product_id,
          description,
          quantity,
          unit_price,
          discount_rate,
          line_total,
          sort_order,
          products(id, name, sku)
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ quotation })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      status,
      tax_rate,
      discount_rate,
      valid_until,
      terms_conditions,
      notes,
      items = [],
    } = body

    // Update quotation
    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .update({
        company_id,
        contact_id,
        opportunity_id,
        title,
        description,
        status,
        tax_rate,
        discount_rate,
        valid_until,
        terms_conditions,
        notes,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (quotationError) {
      return NextResponse.json({ error: quotationError.message }, { status: 500 })
    }

    // Delete existing items and add new ones
    await supabase.from("quotation_items").delete().eq("quotation_id", params.id)

    if (items.length > 0) {
      const quotationItems = items.map((item: any, index: number) => ({
        quotation_id: params.id,
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

    return NextResponse.json({ quotation })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("quotations").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Quotation deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
