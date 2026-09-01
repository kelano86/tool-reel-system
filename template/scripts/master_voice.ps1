# Masters the camera audio into public/voice.wav â€” the composition plays this
# instead of footage.mov's raw track (see BeatAudio in src/ToolReel.tsx).
# Same timeline as footage.mov: every filter is time-invariant, so the
# per-beat srcFrom trims land on identical samples.
#
# Chain (v2): rumble high-pass, FFT denoiser FIRST (the room hiss was what the
# v1 compression+air pumped up), de-esser, 260Hz mud cut, 110Hz low shelf
# (body), 4.2kHz presence, harmonic exciter (the actual "crisp"), gentle 11kHz
# air, 3:1 compression, -1.2dB limiter.
# Re-run after replacing footage.mov.

Set-Location "$PSScriptRoot\.."
# v3: bass shelf raised to +4, air shelf replaced by a -2dB cut above 10kHz.
ffmpeg -hide_banner -v error -y -i public\footage.mov -vn -af "highpass=f=75,afftdn=nr=12:nf=-32:tn=1,deesser,equalizer=f=260:t=q:w=1.2:g=-3,lowshelf=f=110:g=4,equalizer=f=4200:t=q:w=0.8:g=3,aexciter=amount=1.5:drive=8:freq=5500,highshelf=f=10000:g=-2,acompressor=threshold=-20dB:ratio=3:attack=6:release=150:makeup=3,alimiter=limit=-1.2dB:level=false" -ar 48000 public\voice.wav
Write-Output "wrote public\voice.wav"

