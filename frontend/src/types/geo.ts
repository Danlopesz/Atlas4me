/**
 * @module types/geo
 * Core geographic type definitions for the Atlas4Me globe.
 * All GeoJSON-related interfaces follow the RFC 7946 spec subset
 * needed by the game (Feature, Polygon, MultiPolygon.
 */

/** A point on Earth defined by latitude and longitude (degrees). */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** GeoJSON Polygon geometry (RFC 7946 §3.1.6). */
export interface GeoPolygon {
  type: "Polygon";
  /** Array of linear rings. Each ring is an array of [lng, lat] positions. */
  coordinates: number[][][];
}

/** GeoJSON MultiPolygon geometry (RFC 7946 §3.1.7). */
export interface GeoMultiPolygon {
  type: "MultiPolygon";
  /** Array of Polygon coordinate arrays. */
  coordinates: number[][][][];
}

/**
 * A single country feature extracted from Natural Earth GeoJSON.
 * Only the properties relevant to the game are typed —
 * ISO_A3 is the canonical identifier used across the entire system.
 */
export interface CountryFeature {
  type: "Feature";
  properties: {
    /** ISO 3166-1 alpha-3 code (e.g. "BRA", "ARG"). */
    ISO_A3: string;
    /** Normalized ISO alpha-2 code (e.g. "BR", "AR"). Always present after parse — never null. */
    NORMALIZED_ISO: string;
    /** English display name. */
    NAME: string;
  };
  geometry: GeoPolygon | GeoMultiPolygon;
}

/** A typed GeoJSON FeatureCollection containing only CountryFeature entries. */
export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: CountryFeature[];
}
