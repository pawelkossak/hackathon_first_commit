# Approved Alan welcome intro

Use `pilot-plynnosci-alan-welcome.mp4`: the exact owner-approved Creatify Aurora animation, 6.88 seconds, 1280×704, H.264/AAC. Mike approved it as the game intro on 17 November 2026. The local source was recovered from the user's downloaded file and fully decoded; `intro-qa.json` records its SHA-256. The approved animation was not replaced by a locally recomposed substitute.

The game imports it to `/media/intro/alan-welcome.mp4` during dev/build. First entry offers explicit Play and Skip controls, honors voice/volume, shows a transcript and always permits continuing if video playback fails.

Spoken text: “Cześć! Jestem Alan Bartczak i zapraszam Cię do Finance Quest: Pilot Płynności! Miłej zabawy!”

Voice: ElevenLabs Kamil — Expressive,Joyful; Eleven v4, stability 0.5, similarity 0.75, clone strength 0. This is a synthetic character performance, not a clone of Alan's real voice. Speech history: `lXxocynY3xuZspO6CIQI`.

Artwork: `../pitch/art/young-founder-presenting.png` and the existing painted sky. `../tooling/build-alan-intro.py` reproduces the original composition. `../tooling/finalize-alan-intro.py` is an optional unused composition experiment; do not run it over the approved film.
