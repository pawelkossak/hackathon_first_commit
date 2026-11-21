"use client";

import React from "react";
import { NarratorDialogue } from "../narrative";
import { useGameStore } from "../../lib/ui/game-store";
import { useCopy } from "../../lib/ui/copy";

/** The narrator's reaction to the last engine events (store `reaction`, chosen by narrative/reactions). */
export function BoardNarrator() {
  const reaction = useGameStore((s) => s.reaction);
  const status = useGameStore((s) => s.state.core.status);
  const dismiss = useGameStore((s) => s.dismissReaction);
  const { copy, playerGender, narratorGender } = useCopy();

  // A crash has its own single dialog (G19), which shows the same reaction lines.
  if (!reaction || status === "crashed") return null;

  return (
    <div data-testid="board-narrator" className="w-full flex justify-center">
      <NarratorDialogue
        key={`${reaction.week}-${reaction.lineId}`}
        speaker={copy(narratorGender === "female" ? "ui.narrator.szefowa" : "ui.narrator.szef")}
        emotion={reaction.emotion}
        text={reaction.text}
        audioLineId={reaction.lineId}
        playerGender={playerGender}
        narratorGender={narratorGender}
        canBack={false}
        canSkip={false}
        onNext={dismiss}
        nextLabel={copy("ui.btn.close")}
      />
    </div>
  );
}
