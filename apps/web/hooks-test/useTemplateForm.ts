import { InterviewTemplate, Metric, Question } from "@/lib/types";
import { useState, useEffect } from "react";

export const useTemplateForm = (initial?: InterviewTemplate | null) => {
  const defaultMetrics = [
    {
      id: crypto.randomUUID(),
      name: "Speech Clarity",
      description: "Clarity of the candidate’s speech and articulation.",
      weight: 20,
    },
    {
      id: crypto.randomUUID(),
      name: "Confidence",
      description: "Level of confidence during the interview.",
      weight: 20,
    },
    {
      id: crypto.randomUUID(),
      name: "Engagement",
      description: "Candidate’s interest and engagement with the conversation.",
      weight: 20,
    },
    {
      id: crypto.randomUUID(),
      name: "Emotional Tone",
      description: "Tone and emotional expression during responses.",
      weight: 20,
    },
    {
      id: crypto.randomUUID(),
      name: "Body Language",
      description: "Non-verbal cues, posture, and expressions.",
      weight: 20,
    },
  ];

  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  const [question, setQuestion] = useState<Question>({
    id: crypto.randomUUID(),
    questionText: "",
    order: order,
    evaluates: "",
    coreValueId: "",
    alignedWith: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>(defaultMetrics);

  const totalMetricsWeights = metrics.reduce((sum, m) => sum + m.weight, 0);
  // When editing, populate form with existing values
  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setQuestions(
        initial.questions!
      );
      setMetrics(initial.metrics!);
    }
  }, [initial]);

  const resetForm = () => {
    setName("");
    setQuestions([]);
    setMetrics(defaultMetrics);
  };

  const addQuestion = (question: Question) => {
    setQuestions((prev) => [...prev, question]);
    setOrder((prev) => prev + 1);
    clearQuestion();
  };

  const editQuestion = (updated: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const clearQuestion = () => {
    setQuestion({
      id: crypto.randomUUID(),
      questionText: "",
      order: 0,
      evaluates: "",
      coreValueId: "",
      alignedWith: "",
    });
  };

  return {
    name,
    question,
    questions,
    metrics,
    totalMetricsWeights,
    setName,
    setQuestion,
    setQuestions,
    setMetrics,
    resetForm,
    addQuestion,
    editQuestion,
    deleteQuestion,
    clearQuestion,
  };
};
