import { InterviewTemplate, Metric, Question } from "@/lib/types";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useState, useEffect } from "react";

export const useTemplateForm = (initial?: InterviewTemplate | null) => {
  const culture = useCompanyStore((state) => state.culture);
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
  const [responseQualityWeight, setResponseQualityWeight] = useState(30);
  const [cultureFitWeight, setCultureFitWeight] = useState(70)
  const [missionWeight, setMissionWeight] = useState(culture ? 25 : 35);
  const [visionWeight, setVisionWeight] = useState(culture ? 25 : 35);
  const [cultureWeight, setCultureWeight] = useState(culture ? 25 : 0);
  const [coreValuesWeight, setCoreValuesWeight] = useState(culture ? 25 : 30);
  const [order, setOrder] = useState(0);
  const [question, setQuestion] = useState<Question>({
    id: crypto.randomUUID(),
    questionText: "",
    order: order,
    coreValues: "",
    alignedWith: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>(defaultMetrics);

  const totalMetricsWeights = metrics.reduce((sum, m) => sum + m.weight, 0);
  const totalOverallFitWeight = responseQualityWeight + cultureFitWeight;
  const totalCultureFitCompositeWeight = cultureWeight + coreValuesWeight + missionWeight + visionWeight;
  // When editing, populate form with existing values
  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setQuestions(
        initial.questions!
      );
      setMetrics(initial.metrics!);
      setResponseQualityWeight(initial.responseQualityWeight!);
      setCultureFitWeight(initial.cultureFitWeight!);
      setMissionWeight(initial.missionWeight!);
      setVisionWeight(initial.visionWeight!);
      setCultureWeight(initial.cultureWeight!);
      setCoreValuesWeight(initial.coreValuesWeight!);
    }
  }, [initial]);

  const resetForm = () => {
    setName("");
    setQuestions([]);
    setMetrics(defaultMetrics);
    setResponseQualityWeight(30);
    setCultureFitWeight(70);
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
      coreValues: "",
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
    responseQualityWeight,
    cultureFitWeight,
    setResponseQualityWeight,
    setCultureFitWeight,
    totalOverallFitWeight,
    totalCultureFitCompositeWeight,
    missionWeight,
    visionWeight,
    cultureWeight,
    coreValuesWeight,
    setMissionWeight,
    setVisionWeight,
    setCultureWeight,
    setCoreValuesWeight,
  };
};
