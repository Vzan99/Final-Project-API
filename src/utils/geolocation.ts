import axios from "axios";

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    console.warn("OPENCAGE_API_KEY is missing");
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
    );

    const components = response.data.results[0]?.components;
    return components?.city || components?.town || components?.village || null;
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return null;
  }
}
