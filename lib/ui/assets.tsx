import React from "react";
import spritesData from "../../design/contracts/runtime-sprites.json";
import { Placeholder } from "../../components/ui/Placeholder";

export interface AssetDescriptor {
  id: string;
  width: number;
  height: number;
  category: string;
  mediaPath: string;
  source: string;
}

export type KnownAssetId = (typeof spritesData)[number]["id"];

const ASSET_REGISTRY = new Map<string, AssetDescriptor>();

for (const sprite of spritesData) {
  ASSET_REGISTRY.set(sprite.id, {
    id: sprite.id,
    width: sprite.width,
    height: sprite.height,
    category: sprite.category,
    mediaPath: `/media/${sprite.path.replace(/^runtime-media\//, "")}`,
    source: sprite.source,
  });
}

/**
 * Returns the asset descriptor for a given ID.
 * If not in the sprite catalog, returns a fallback descriptor with estimated dimensions.
 */
export function getAsset(id: string): AssetDescriptor {
  const found = ASSET_REGISTRY.get(id);
  if (found) return found;

  return {
    id,
    width: 256,
    height: 256,
    category: "custom",
    mediaPath: `/media/${id}.webp`,
    source: `assets/custom/${id}.webp`,
  };
}

/**
 * Returns all registered asset IDs.
 */
export function getAllAssetIds(): string[] {
  return Array.from(ASSET_REGISTRY.keys());
}

export interface GameAssetProps {
  id: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackToPlaceholder?: boolean;
}

/**
 * GameAsset component.
 * In Phase 1 (no media files in public/media), always returns a styled, sized Placeholder.
 * In Phase 2, if the file is available, renders Next Image or <img>.
 */
export function GameAsset({
  id,
  alt,
  className = "",
  width,
  height,
  fallbackToPlaceholder = true,
}: GameAssetProps) {
  const asset = getAsset(id);
  const targetWidth = width ?? asset.width;
  const targetHeight = height ?? asset.height;

  // In Phase 1 or when fallback is active, render Placeholder
  if (fallbackToPlaceholder) {
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

  /* eslint-disable-next-line @next/next/no-img-element */
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
