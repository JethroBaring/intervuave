"use client";

import { ELEVENLABS_API_KEY } from "./constants";

export const speak = async (
  text: string,
  onSpeakingChange: (isSpeaking: boolean) => void
): Promise<void> => {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/IKne3meq5aSn9XLyUdCD/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY, // Use env variable for security
        },
        body: JSON.stringify({
          text: text || "Welcome to the interview. Let's begin",
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.99,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    console.log("🎧 Received audio blob, size:", audioBlob.size, "bytes");

    const audioUrl = URL.createObjectURL(audioBlob);
    const audioElement = document.createElement("audio");
    audioElement.src = audioUrl;

    return new Promise<void>((resolve, reject) => {
      audioElement.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log("✅ Audio finished playing");
        onSpeakingChange?.(false); // ✅ Set speaking = false after done
        resolve();
      };

      audioElement.onerror = (e) => {
        console.error("❌ Audio element error:", e);
        onSpeakingChange?.(false); // ✅ Set speaking = false after done
        reject(e);
      };

      document.body.appendChild(audioElement);

      audioElement
        .play()
        .then(() => {
          console.log("▶️ Audio is playing");
          onSpeakingChange?.(true); // 🔥 Set speaking true ONLY when audio really plays
        })
        .catch((playError) => {
          console.error("❌ Play error:", playError);
          onSpeakingChange?.(false); // ✅ Set speaking = false after done
          reject(playError);
        });
    });
  } catch (error) {
    console.error("❌ API or playback error:", error);
    throw error;
  }
};

// export const speak = (text: string): Promise<void> => {
//   return new Promise((resolve) => {
//     console.log(`[Simulated ElevenLabs] Speaking: "${text}"`);
//     const estimatedDuration = Math.max(2000, text.length * 50); // simulate ~50ms per character
//     setTimeout(() => {
//       console.log(`[Simulated ElevenLabs] Finished: "${text}"`);
//       resolve();
//     }, estimatedDuration);
//   });
// };
