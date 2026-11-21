// Design tokens at runtime come from lib/generated/tokens.json, emitted by scripts/build-assets.ts
// from design/tokens.json. No runtime module imports design/.
import tokensData from "../generated/tokens.json";

export const tokens = tokensData;

export const gameTheme = {
  light: tokensData.game.light,
  dark: tokensData.game.dark,
};

export const typography = tokensData.game.type;
export const zLayers = tokensData.game.zLayers;
export const motionDurations = tokensData.game.motion;
export const interaction = tokensData.game.interaction;
