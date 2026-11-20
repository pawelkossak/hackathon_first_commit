# Sound source and project use

All 35 WAV files in this folder were generated for Pilot Płynności by deterministic oscillator, envelope and filtered-noise synthesis in `design/tooling/render-sfx.py`. No downloaded recording, third-party sample, voice, music or ElevenLabs output was used.

The project can use, edit and bundle these generated files and their generator. There are no external sample attribution obligations attached to these original files. This statement does not relicense any unrelated asset in the repository.

Format: mono PCM WAV, 22,050 Hz, signed 16 bit. Use the WAV files directly for short browser effects. All endpoints are zero; maximum peak is below 0.23 full scale. Master volume and SFX preferences still apply.

`design/contracts/sound-cue-map.json` is authoritative for exact scene/action mapping, gain, timing, cooldown, priority, deduplication and interruption. Sound never commits gameplay state. Narrator speech ducks effects by 12 dB. Hover, typing and loader loops are silent. Native push and email do not autoplay game audio.

Open alternatives inspected on 17 November 2026, not bundled here:

- Kenney Interface Sounds: https://kenney.nl/assets/interface-sounds — 100 files, labelled CC0. Kenney's support page explicitly permits commercial projects and does not require attribution: https://kenney.nl/support . Keep the downloaded package licence if substituting any file.
- Freesound FAQ: https://freesound.org/help/faq/ — licences vary per sound (CC0, CC BY, CC BY-NC and legacy cases). A search result is not a blanket licence; retain each recording's source, author and licence before importing it.
- Sonniss GDC bundle licence: https://sonniss.com/gdc-bundle-license/ — royalty-free project use under its own terms, not CC0. The current licence distinguishes finished project use from distributing a standalone sound/sample/asset pack. No Sonniss audio was downloaded or included in this handoff.

These source checks provide optional replacements. No external download is required to use the delivered 35 effects.
