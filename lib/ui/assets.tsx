/* eslint-disable @next/next/no-img-element */
import React from "react";
// The registry is the generated manifest (scripts/build-assets.ts): only sprites whose file was
// published to public/media are listed. No runtime module imports design/.
import generatedManifest from "../generated/asset-manifest.json";
import { Placeholder } from "../../components/ui/Placeholder";

export interface AssetDescriptor {
  id: string;
  width: number;
  height: number;
  category: string;
  /** Public URL of the published file; null for an id the registry does not know. */
  mediaPath: string | null;
}

/** Size of the placeholder drawn for an unknown id when the caller gives no size. */
export const UNKNOWN_ASSET_SIZE = 256;

const ASSET_REGISTRY = new Map<string, AssetDescriptor>();

for (const sprite of generatedManifest.sprites) {
  ASSET_REGISTRY.set(sprite.id, {
    id: sprite.id,
    width: sprite.width,
    height: sprite.height,
    category: sprite.category,
    mediaPath: sprite.mediaPath,
  });
}

/**
 * Returns the asset descriptor for a given ID.
 * An id outside the registry gets no media path, so GameAsset draws a sized Placeholder instead of
 * requesting a file that does not exist.
 */
export function getAsset(id: string): AssetDescriptor {
  const found = ASSET_REGISTRY.get(id);
  if (found) return found;

  return {
    id,
    width: UNKNOWN_ASSET_SIZE,
    height: UNKNOWN_ASSET_SIZE,
    category: "custom",
    mediaPath: null,
  };
}

/** Whether the registry has a published file for this id. */
export function isKnownAsset(id: string): boolean {
  return ASSET_REGISTRY.has(id);
}

/**
 * Returns all registered asset IDs.
 */
export function getAllAssetIds(): string[] {
  return Array.from(ASSET_REGISTRY.keys());
}

export type GeneratedAssetManifest = typeof generatedManifest;

export function getGeneratedManifest(): GeneratedAssetManifest {
  return generatedManifest;
}

export function isMediaReady(): boolean {
  return generatedManifest.totalSprites > 0;
}

export interface GameAssetProps {
  id: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  /** Forces the sized Placeholder even for a known id. An unknown id always gets the Placeholder. */
  fallbackToPlaceholder?: boolean;
}

/**
 * GameAsset component: the published WebP for a registry id, otherwise a Placeholder of the same size.
 */
export function GameAsset({
  id,
  alt,
  className = "",
  width,
  height,
  fallbackToPlaceholder = false,
}: GameAssetProps) {
  const asset = getAsset(id);
  const targetWidth = width ?? asset.width;
  const targetHeight = height ?? asset.height;

  if (fallbackToPlaceholder || asset.mediaPath === null) {
    return (
      <Placeholder
        id={asset.id}
        width={targetWidth}
        height={targetHeight}
        label={alt}
        className={className}
      />
    );
  }

  return (
    <img
      src={asset.mediaPath}
      alt={alt ?? asset.id}
      width={targetWidth}
      height={targetHeight}
      className={className}
      loading="lazy"
    />
  );
}

export { Placeholder };
