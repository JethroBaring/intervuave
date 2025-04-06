import { Candidate, InterviewTemplate, Metric, Question } from "@/lib/types";
import { useState, useEffect } from "react";

export const useTemplateForm = (initial?: InterviewTemplate | null) => {
  const [candidate, setCandidate] = useState<Candidate>({
    firstName: "",
    lastName: "",
    email: "",
  });


  // When editing, populate form with existing values
  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setQuestions(initial.questions!);
      setMetrics(initial.metrics!);
    }
  }, [initial]);

  const resetForm = () => {
    setName("");
    setQuestions([]);
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
