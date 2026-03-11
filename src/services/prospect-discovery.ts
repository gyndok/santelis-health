interface PlaceResult {
  displayName: string;
  formattedAddress: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
}

export interface DiscoveryResult {
  practiceName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  websiteUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
}

/**
 * Search Google Maps Places API (New) for doctors in a location.
 * Returns up to 20 results per query.
 */
export async function discoverByLocation(params: {
  city: string;
  state: string;
  specialty?: string;
}): Promise<DiscoveryResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API_KEY");

  const searchTerm = params.specialty
    ? `${params.specialty} doctor in ${params.city} ${params.state}`
    : `doctor in ${params.city} ${params.state}`;

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.location",
      },
      body: JSON.stringify({
        textQuery: searchTerm,
        maxResultCount: 20,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Places API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const places: PlaceResult[] = (data.places || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => ({
      displayName: p.displayName?.text || "",
      formattedAddress: p.formattedAddress || "",
      nationalPhoneNumber: p.nationalPhoneNumber || "",
      rating: p.rating ?? undefined,
      userRatingCount: p.userRatingCount ?? undefined,
      websiteUri: p.websiteUri || null,
      location: p.location || null,
    }),
  );

  return places.map((p) => {
    const { city, state } = parseAddress(p.formattedAddress);
    return {
      practiceName: p.displayName,
      address: p.formattedAddress,
      city,
      state,
      phone: p.nationalPhoneNumber || "",
      websiteUrl: p.websiteUri || null,
      googleRating: p.rating ?? null,
      googleReviewCount: p.userRatingCount ?? null,
    };
  });
}

/** Extract city and state from a formatted address like "123 Main St, Houston, TX 77001, USA" */
function parseAddress(address: string): { city: string; state: string } {
  const parts = address.split(",").map((s) => s.trim());
  if (parts.length >= 3) {
    const city = parts[parts.length - 3] || "";
    const stateZip = parts[parts.length - 2] || "";
    const state = stateZip.split(" ")[0] || "";
    return { city, state };
  }
  return { city: "", state: "" };
}
