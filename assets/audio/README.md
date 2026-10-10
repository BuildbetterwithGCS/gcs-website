# Nexus demo narration

Ten MP3 tracks are shipped in `nexus-demo/` and served from the same origin as the demo. The player never uses generator landing pages or expiring preview URLs. `nexus-demo/manifest.json` records the complete scripts, measured durations and SHA-256 hashes. The spoken walkthrough lasts about 100 seconds.

The narration is AI-generated in a clear conversational voice. It describes the synthetic demonstration, including scripted assistant responses and sample actions. It does not claim a customer's systems are connected or real assignments are sent from the sandbox.

Playback begins on the Play gesture before the tab animation. One audio element is reused across scenes, with captions as a fallback if a track cannot play. Pause, resume, mute, zero volume, scene skipping and completion are supported. Leaving the page pauses the demo; press Resume when returning.

Run `npm test -- --runInBand`, `npm run test:links` and `npm run test:public-exposure` before release. Narration changes must include real audio bytes and updated measured durations, not only generated links.
