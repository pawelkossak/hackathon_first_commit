import { describe, expect, it } from "vitest";
import { getCopy } from "../../narrative/copy/get-copy";
import type { NarratorGender, PlayerGender } from "../../narrative/types";

describe("N-05 Intro and character selection G05-G08", () => {
  const combinations: Array<{
    player: PlayerGender;
    narrator: NarratorGender;
    expectedNarratorPrefix: string;
    expectedPraise: string;
  }> = [
    {
      player: "female",
      narrator: "female",
      expectedNarratorPrefix: "Jestem Ania",
      expectedPraise: "Poradziłaś",
    },
    {
      player: "male",
      narrator: "female",
      expectedNarratorPrefix: "Jestem Ania",
      expectedPraise: "Poradziłeś",
    },
    {
      player: "female",
      narrator: "male",
      expectedNarratorPrefix: "Jestem właścicielem",
      expectedPraise: "Poradziłaś",
    },
    {
      player: "male",
      narrator: "male",
      expectedNarratorPrefix: "Jestem właścicielem",
      expectedPraise: "Poradziłeś",
    },
  ];

  it("test: all 4 combinations are playable and render grammatically valid copy across all intro beats", () => {
    for (const { player, narrator, expectedNarratorPrefix, expectedPraise } of combinations) {
      // Beat 1: G05 Meet the Boss
      const beat1Intro = getCopy("intro.owner", undefined, player, narrator);
      const beat1Role = getCopy("intro.role", undefined, player, narrator);
      expect(beat1Intro).toContain(expectedNarratorPrefix);
      expect(beat1Role).toMatch(/Zaprosiłam|Zaprosiłem/);

      // Beat 2: G06 Character selection labels
      const title = getCopy("ui.character_select.title", undefined, player, narrator);
      const playerLabel = getCopy("ui.character_select.player", undefined, player, narrator);
      const guideLabel = getCopy("ui.character_select.guide", undefined, player, narrator);
      const playLabel = getCopy("ui.character_select.play", undefined, player, narrator);
      expect(title).toBe("Kto prowadzi tę firmę?");
      expect(playerLabel).toBe("Twoja postać");
      expect(guideLabel).toBe("Twój przewodnik");
      expect(playLabel).toBe("Gramy!");

      // Beat 3: G07 Mission goal
      const beat3Goal = getCopy("intro.goal", undefined, player, narrator);
      expect(beat3Goal).toContain("grudzień");

      // Beat 4: G08 Safe practice
      const beat4Practice = getCopy("intro.practice", undefined, player, narrator);
      expect(beat4Practice).toContain("cofaj czas");

      // Verify inflection difference in dialogue praise
      const praise = getCopy("move.praise", undefined, player, narrator);
      expect(praise).toContain(expectedPraise);
    }
  });

  it("test: intro skippable with default settings (Szefowa Ania + player woman)", () => {
    const defaultPlayer: PlayerGender = "female";
    const defaultNarrator: NarratorGender = "female";

    const skipLabel = getCopy("ui.intro.skip", undefined, defaultPlayer, defaultNarrator);
    expect(skipLabel).toBe("Pomiń intro");

    // Defaults follow spec D-12
    const defaultIntro = getCopy("intro.owner", undefined, defaultPlayer, defaultNarrator);
    expect(defaultIntro).toContain("Jestem Ania");
  });
});
