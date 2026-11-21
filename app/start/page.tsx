"use client";

import { useRouter } from "next/navigation";
import { IntroFlow, VoicePlayer, type IntroSettings } from "../../components/narrative";
import { useSettingsStore } from "../../narrative/settings-store";

/** G05–G08: the narrative intro (with CharacterSelect inside), then the campaign map (GAME-DESIGN §9 step 1). */
export default function StartPage() {
  const router = useRouter();
  const playerGender = useSettingsStore((s) => s.playerGender);
  const narratorGender = useSettingsStore((s) => s.narratorGender);
  const setPlayerGender = useSettingsStore((s) => s.setPlayerGender);
  const setNarratorGender = useSettingsStore((s) => s.setNarratorGender);

  const handleComplete = (settings: IntroSettings) => {
    setPlayerGender(settings.playerGender);
    setNarratorGender(settings.narratorGender);
    router.push("/mapa");
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center" data-testid="intro-page">
      <IntroFlow initialSettings={{ playerGender, narratorGender }} onComplete={handleComplete} />
      <VoicePlayer />
    </div>
  );
}
