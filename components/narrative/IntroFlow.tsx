"use client";

import React, { useState } from "react";
import type { NarratorGender, PlayerGender } from "../../narrative/types";
import { getCopy } from "../../narrative/copy/get-copy";
import { CharacterSelect } from "./CharacterSelect";
import { NarratorDialogue } from "./NarratorDialogue";

/** G05 shows intro.owner and intro.role as one caption, so both recordings play in order. */
const INTRO_OWNER_LINES = ["intro.owner", "intro.role"] as const;

export interface IntroSettings {
  playerGender: PlayerGender;
  narratorGender: NarratorGender;
}

export interface IntroFlowProps {
  initialSettings?: Partial<IntroSettings>;
  onComplete: (settings: IntroSettings) => void;
  className?: string;
}

export type IntroStep = 1 | 2 | 3 | 4;

export function IntroFlow({
  initialSettings,
  onComplete,
  className = "",
}: IntroFlowProps) {
  const [step, setStep] = useState<IntroStep>(1);
  const [playerGender, setPlayerGender] = useState<PlayerGender>(
    initialSettings?.playerGender ?? "female"
  );
  const [narratorGender, setNarratorGender] = useState<NarratorGender>(
    initialSettings?.narratorGender ?? "female"
  );

  const speakerName = getCopy("ui.narrator.speaker", undefined, playerGender, narratorGender);

  const handleSkip = () => {
    onComplete({ playerGender, narratorGender });
  };

  const handleFinish = () => {
    onComplete({ playerGender, narratorGender });
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[500px] w-full p-4 ${className}`}>
      {/* Beat 1: G05 Meet the Boss */}
      {step === 1 && (
        <NarratorDialogue
          speaker={speakerName}
          emotion="welcoming"
          text={`${getCopy("intro.owner", undefined, playerGender, narratorGender)} ${getCopy("intro.role", undefined, playerGender, narratorGender)}`}
          audioLineId={INTRO_OWNER_LINES}
          playerGender={playerGender}
          narratorGender={narratorGender}
          canBack={false}
          canSkip={true}
          onNext={() => setStep(2)}
          onSkip={handleSkip}
          nextLabel={getCopy("ui.intro.next", undefined, playerGender, narratorGender)}
          skipLabel={getCopy("ui.intro.skip", undefined, playerGender, narratorGender)}
        />
      )}

      {/* Beat 2: G06 Player and Narrator Selection */}
      {step === 2 && (
        <CharacterSelect
          playerGender={playerGender}
          narratorGender={narratorGender}
          onPlayerGenderChange={setPlayerGender}
          onNarratorGenderChange={setNarratorGender}
          onBack={() => setStep(1)}
          onConfirm={() => setStep(3)}
        />
      )}

      {/* Beat 3: G07 Mission Goal */}
      {step === 3 && (
        <NarratorDialogue
          speaker={speakerName}
          emotion="confident"
          text={getCopy("intro.goal", undefined, playerGender, narratorGender)}
          audioLineId="intro.goal"
          playerGender={playerGender}
          narratorGender={narratorGender}
          canBack={true}
          canSkip={true}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          onSkip={handleSkip}
          backLabel={getCopy("ui.intro.back", undefined, playerGender, narratorGender)}
          nextLabel={getCopy("ui.intro.next", undefined, playerGender, narratorGender)}
          skipLabel={getCopy("ui.intro.skip", undefined, playerGender, narratorGender)}
        />
      )}

      {/* Beat 4: G08 Learn through first choice / How to play */}
      {step === 4 && (
        <NarratorDialogue
          speaker={speakerName}
          emotion="welcoming"
          text={getCopy("intro.practice", undefined, playerGender, narratorGender)}
          audioLineId="intro.practice"
          playerGender={playerGender}
          narratorGender={narratorGender}
          canBack={true}
          canSkip={false}
          onBack={() => setStep(3)}
          onNext={handleFinish}
          backLabel={getCopy("ui.intro.back", undefined, playerGender, narratorGender)}
          nextLabel={getCopy("ui.intro.first_decision", undefined, playerGender, narratorGender)}
        />
      )}
    </div>
  );
}
