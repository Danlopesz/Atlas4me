/**
 * @module utils/geoJsonParser
 * Typed parser for Natural Earth GeoJSON data.
 * Validates the raw structure before casting, normalizes ISO codes
 * to alpha-3 at the data boundary, and filters out features with
 * missing or unresolvable identifiers.
 *
 * ISO NORMALIZATION STRATEGY (priority cascade for Alpha-3):
 * 1. ISO_A3 — direct alpha-3 (skip sentinel values "-1", "-99")
 * 2. ADM0_A3 — Alternative Alpha-3
 * 3. null → feature is dropped from the collection
 */

import type { GeoFeatureCollection, CountryFeature } from "../types/geo";

// ────────────────────────── ISO Normalization ─────────────────────────────

function normalizeIso3(props: Record<string, unknown>): string | null {
    // 1. Tentar ISO_A3 direto
    if (props.ISO_A3 && props.ISO_A3 !== "-1" && props.ISO_A3 !== "-99") {
        return props.ISO_A3 as string;
    }
    // 2. Tentar ADM0_A3 (usado em muitos shapes do Natural Earth)
    if (typeof props.ADM0_A3 === "string" && props.ADM0_A3 !== "-1" && props.ADM0_A3 !== "-99") {
        return props.ADM0_A3;
    }
    return null;
}

// ────────────────────────── Type Guard ─────────────────────────────────────

function isCountryFeature(value: unknown): value is CountryFeature {
    if (value === null || value === undefined || typeof value !== "object") return false;
    const obj = value as { properties?: unknown };
    if (obj.properties === null || obj.properties === undefined || typeof obj.properties !== "object") return false;
    const props = obj.properties as { ISO_A3?: unknown, ADM0_A3?: unknown };

    return (typeof props.ISO_A3 === "string" && props.ISO_A3 !== "-99") ||
        (typeof props.ADM0_A3 === "string" && props.ADM0_A3 !== "-99");
}

// ────────────────────────── Public Parser ──────────────────────────────────

export function parseGeoJSON(raw: unknown): GeoFeatureCollection {
    if (raw === null || raw === undefined || typeof raw !== "object") {
        throw new Error("GeoJSON inválido: esperado um objeto, recebido " + typeof raw);
    }

    const data = raw as { type?: unknown; features?: unknown };
    if (data.type !== "FeatureCollection") throw new Error(`GeoJSON inválido.`);
    if (!Array.isArray(data.features)) throw new Error("GeoJSON inválido: campo 'features' ausente.");

    const typed: CountryFeature[] = (data.features as unknown[]).filter(isCountryFeature);

    const features: CountryFeature[] = typed
        .map((feature) => {
            const rawProps = feature.properties as unknown as Record<string, unknown>;
            const iso3 = normalizeIso3(rawProps);
            if (iso3 === null) return null;

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    NORMALIZED_ISO: iso3, // Agora armazena o ISO de 3 letras!
                },
            };
        })
        .filter((f): f is CountryFeature => f !== null);

    return { type: "FeatureCollection", features };
}