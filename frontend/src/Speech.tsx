export function speak(message: string) {
  const synth = window.speechSynthesis
  synth.onvoiceschanged = () => {
    const utterance = new SpeechSynthesisUtterance(message)

    // Try to set the "Samantha" voice, because it's more natural.
    const voices = synth.getVoices()
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === "Samantha") {
        utterance.voice = voices[i]
      }
    }

    synth.speak(utterance)
  }
}