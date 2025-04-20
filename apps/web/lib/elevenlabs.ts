"use client";

import { ELEVENLABS_API_KEY, ELEVENLABS_API_KEY_1, ELEVENLABS_API_KEY_2, ELEVENLABS_API_KEY_3 } from "./constants";

let sharedAudioContext: AudioContext | null = null;
let sharedAudioDestination: MediaStreamAudioDestinationNode | null = null;

export const setSharedAudioContext = (ctx: AudioContext, dest: MediaStreamAudioDestinationNode) => {
  sharedAudioContext = ctx;
  sharedAudioDestination = dest;
};

const tryWithApiKey = async (
  text: string,
  apiKey: string
): Promise<Response> => {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/IKne3meq5aSn9XLyUdCD/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
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
};

export const speak = async (
  text: string,
  onSpeakingChange: (isSpeaking: boolean) => void
): Promise<void> => {
  const apiKeys = [ELEVENLABS_API_KEY, ELEVENLABS_API_KEY_1, ELEVENLABS_API_KEY_2, ELEVENLABS_API_KEY_3];
  let lastError: Error | null = null;

  for (const apiKey of apiKeys) {
    try {
      const response = await tryWithApiKey(text, apiKey);

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`API error with key ${apiKey.slice(0, 8)}...: ${response.status} - ${errorText}`);
        continue; // Try next key
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);

      if (!sharedAudioContext || !sharedAudioDestination) {
        console.warn("AudioContext or Destination not initialized properly.");
      } else {
        const audioSource = sharedAudioContext.createMediaElementSource(audioElement);
        audioSource.connect(sharedAudioContext.destination);
        audioSource.connect(sharedAudioDestination);
      }

      return new Promise<void>((resolve, reject) => {
        audioElement.onended = () => {
          URL.revokeObjectURL(audioUrl);
          console.log("✅ Audio finished playing");
          onSpeakingChange?.(false);
          resolve();
        };

        audioElement.onerror = (e) => {
          console.error("❌ Audio element error:", e);
          onSpeakingChange?.(false);
          reject(e);
        };

        document.body.appendChild(audioElement);

        audioElement
          .play()
          .then(() => {
            console.log("▶️ Audio is playing");
            onSpeakingChange?.(true);
          })
          .catch((playError) => {
            console.error("❌ Play error:", playError);
            onSpeakingChange?.(false);
            reject(playError);
          });
      });
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ API error with key ${apiKey.slice(0, 8)}...:`, error);
      // Continue to next key
    }
  }

  // If we get here, all keys failed
  throw lastError || new Error("All API keys failed");
};


// export const speak = (
//   text: string,
//   onSpeakingChange: (isSpeaking: boolean) => void
// ): Promise<void> => {
//   return new Promise((resolve) => {
//     console.log(`[Simulated ElevenLabs] Speaking: "${text}"`);
//     const estimatedDuration = Math.max(2000, text.length * 50); // simulate ~50ms per character
//     setTimeout(() => {
//       console.log(`[Simulated ElevenLabs] Finished: "${text}"`);
//       resolve();
//     }, estimatedDuration);
//   });
// };
