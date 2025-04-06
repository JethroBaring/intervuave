import { interviewer } from "@/lib/constants";
import { CallStatus, Message, Question, SavedMessage } from "@/lib/types";
import { vapi } from "@/lib/vapi.sdk";
import { useState, useEffect } from "react";

import { useInterviewStore } from "@/stores-test/interviewStore";

export const useInterviewer = (questions: Question[] | null) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<{
    content: string;
    role: "user" | "assistant";
  } | null>(null);

  const addQuestionTimestamp = useInterviewStore((s) => s.addQuestionTimestamp);
  const endCurrentQuestion = useInterviewStore((s) => s.endCurrentQuestion);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        setLastMessage({
          content: message.transcript,
          role: message.role === "assistant" ? "assistant" : "user",
        });
      }

      if (
        message.type === "transcript" &&
        message.role === "assistant" &&
        message.transcriptType === "final"
      ) {
        const matched = questions?.find((q) =>
          message.transcript.includes(q.questionText)
        );
        if (matched) {
          addQuestionTimestamp(matched.id!);
        }
      }
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);

      // ✅ End current question timestamp when user stops speaking
      endCurrentQuestion();
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onError = (error: Error) => {
      console.error("Vapi Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [questions, addQuestionTimestamp, endCurrentQuestion]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    const formattedQuestions =
      questions?.map((q) => `- ${q.questionText}`).join("\n") || "";

    await vapi.start(interviewer, {
      variableValues: {
        questions: formattedQuestions,
      },
    });
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return {
    callStatus,
    isSpeaking,
    messages,
    lastMessage,
    handleCall,
    handleDisconnect,
  };
};
