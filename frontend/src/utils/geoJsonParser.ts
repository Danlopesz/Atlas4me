/**
 * @module utils/geoJsonParser
 * Typed parser for Natural Earth GeoJSON data.
 * Validates the raw structure before casting, normalizes ISO codes
 * to alpha-2 at the data boundary, and filters out features with
 * missing or unresolvable identifiers.
 *
 * ISO NORMALIZATION STRATEGY (priority cascade):
 *   1. ISO_A2 — direct alpha-2 (skip sentinel values "-1", "-99")
 *   2. POSTAL — 2-letter postal code (common fallback in Natural Earth)
 *   3. ADM0_A3 — truncate to first 2 chars (last resort)
 *   4. null → feature is dropped from the collection
 */

import type { GeoFeatureCollection, CountryFeature } from "../types/geo";

// ────────────────────────── ISO Normalization ─────────────────────────────

/**
 * Extracts a normalized 2-letter ISO code from Natural Earth properties.
 * Returns null if no valid code can be derived — the feature will be
 * filtered out downstream.
 */
function normalizeIso2(props: Record<string, unknown>): string | null {
  // 1. Tentar ISO_A2 direto — válido se não for "-1" ou "-99"
  if (props.ISO_A2 && props.ISO_A2 !== "-1" && props.ISO_A2 !== "-99") {
    return props.ISO_A2 as string;
  }
  // 2. Tentar POSTAL como fallback
  if (
    typeof props.POSTAL === "string" &&
    props.POSTAL.length === 2
  ) {
    return props.POSTAL;
  }
  // 3. Truncar ADM0_A3 para 2 caracteres — último recurso
  if (
    typeof props.ADM0_A3 === "string" &&
    props.ADM0_A3.length >= 2
  ) {
    return props.ADM0_A3.slice(0, 2);
  }
  // 4. Não foi possível normalizar — filtrar esse país
  return null;
}

// ────────────────────────── Type Guard ─────────────────────────────────────

/**
 * Runtime type guard for CountryFeature.
 * Validates that a value has the expected shape before narrowing.
 */
function isCountryFeature(value: unknown): value is CountryFeature {
  if (value === null || value === undefined || typeof value !== "object") {
    return false;
  }

  const obj = value as { properties?: unknown };

  if (obj.properties === null || obj.properties === undefined || typeof obj.properties !== "object") {
    return false;
  }

  const props = obj.properties as { ISO_A3?: unknown };

  return typeof props.ISO_A3 === "string" && props.ISO_A3 !== "-99";
}

// ────────────────────────── Public Parser ──────────────────────────────────

/**
 * Parses raw GeoJSON data into a strictly typed GeoFeatureCollection.
 *
 * Pipeline:
 *   1. Validates `raw.type === "FeatureCollection"` — throws if not.
 *   2. Filters features with `isCountryFeature` type guard.
 *   3. Normalizes ISO to alpha-2 via `normalizeIso2` and injects
 *      `NORMALIZED_ISO` into each feature's properties.
 *   4. Drops features where normalization returned null.
 *
 * @param raw - Untyped GeoJSON data (e.g. from a JSON import or fetch)
 * @returns A validated, filtered, ISO-normalized GeoFeatureCollection
 * @throws Error if the input is not a valid FeatureCollection
 */
export function parseGeoJSON(raw: unknown): GeoFeatureCollection {
  if (
    raw === null ||
    raw === undefined ||
    typeof raw !== "object"
  ) {
    throw new Error(
      "GeoJSON inválido: esperado um objeto, recebido " + typeof raw
    );
  }

  const data = raw as { type?: unknown; features?: unknown };

  if (data.type !== "FeatureCollection") {
    throw new Error(
      `GeoJSON inválido: esperado FeatureCollection, recebido "${String(data.type)}"`
    );
  }

  if (!Array.isArray(data.features)) {
    throw new Error("GeoJSON inválido: campo 'features' ausente ou não é array");
  }

  // Step 1: Type-guard filter
  const typed: CountryFeature[] = (data.features as unknown[]).filter(
    isCountryFeature
  );

  // Step 2: Normalize ISO to alpha-2 + filter nulls
  const features: CountryFeature[] = typed
    .map((feature) => {
      const rawProps = feature.properties as unknown as Record<string, unknown>;
      const iso2 = normalizeIso2(rawProps);
      if (iso2 === null) return null;

      return {
        ...feature,
        properties: {
          ...feature.properties,
          NORMALIZED_ISO: iso2,
        },
      };
    })
    .filter((f): f is CountryFeature => f !== null);

  return {
    type: "FeatureCollection",
    features,
  };
}
