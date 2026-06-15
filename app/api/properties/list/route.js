import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";
import { getOrSetCache } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type") || "all";
    const listingType = searchParams.get("listing_type") || "all";
    const region = searchParams.get("region") || "all";
    const minPrice = parseInt(searchParams.get("min_price") || "0");
    const maxPrice = parseInt(searchParams.get("max_price") || "10000000");
    const sortBy = searchParams.get("sort_by") || "newest";

    // Generate a deterministic cache key based on all parameters
    const cacheKey = `properties:list:${JSON.stringify({
      limit,
      page,
      type,
      listingType,
      region,
      minPrice,
      maxPrice,
      sortBy,
    })}`;

    const properties = await getOrSetCache(
      cacheKey,
      async () => {
        let query = supabase
          .from("properties")
          .select(
            "id, title, type, price, location, address, size, bedrooms, bathrooms, images, status, created_at, description, features, region, property_type, rental_price, listing_type, negotiable",
            { count: "exact" },
          )
          .eq("status", "approved");

        // Apply filters (matching the logic in mobile's propertyStore.ts)
        if (type !== "all") {
          query = query.eq("type", type);
        }
        if (listingType !== "all") {
          query = query.eq("listing_type", listingType);
        }
        if (region !== "all") {
          query = query.eq("region", region);
        }

        const priceField =
          listingType === "rent" || listingType === "airbnb" ? "rental_price" : "price";
        if (minPrice > 0 || maxPrice < 10000000) {
          query = query.gte(priceField, minPrice).lte(priceField, maxPrice);
        }

        // Apply sorting
        switch (sortBy) {
          case "price-low":
            query = query.order("price", { ascending: true });
            break;
          case "price-high":
            query = query.order("price", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, error, count } = await query.range(from, to);

        if (error) {
          throw new Error(error.message);
        }

        return {
          data,
          total: count || 0,
          page,
          limit,
        };
      },
      300,
    ); // Cache for 5 minutes

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error in /api/properties/list:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
