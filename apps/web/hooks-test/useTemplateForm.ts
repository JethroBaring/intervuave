import { InterviewTemplate, Metric, Question } from "@/lib/types";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useState, useEffect, useMemo } from "react";

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
  const [cultureFitWeight, setCultureFitWeight] = useState(70);
  const [missionWeight, setMissionWeight] = useState(0);
  const [visionWeight, setVisionWeight] = useState(0);
  const [cultureWeight, setCultureWeight] = useState(0);
  const [coreValuesWeight, setCoreValuesWeight] = useState(0);
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
  const totalCultureFitCompositeWeight =
    cultureWeight + coreValuesWeight + missionWeight + visionWeight;
    const alignedWiths = useMemo(() => 
      [...new Set(questions.map(question => question.alignedWith))], 
      [questions]
    );
  // When editing, populate form with existing values
  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setQuestions(initial.questions!);
      setMetrics(initial.metrics!);
      setResponseQualityWeight(initial.responseQualityWeight!);
      setCultureFitWeight(initial.cultureFitWeight!);
      setMissionWeight(initial.missionWeight!);
      setVisionWeight(initial.visionWeight!);
      setCultureWeight(initial.cultureWeight!);
      setCoreValuesWeight(initial.coreValuesWeight!);
    }
  }, [initial]);

  useEffect(() => {
    console.log("hello")
    // Determine presence of each key alignment
    const hasMission = alignedWiths.includes("MISSION");
    const hasVision = alignedWiths.includes("VISION");
    const hasCulture = alignedWiths.includes("CULTURE");

    // Variables to hold calculated weights
    let missionW = 0;
    let visionW = 0;
    let cultureW = 0;
    let coreValuesW = 0;

    // --- Logic based on combinations ---
    // Since at least one of M, V, C is always present, we cover all possible cases.

    if (hasMission && hasVision && hasCulture) {
      // Case 1: All three present (M, V, C)
      missionW = 25;
      visionW = 25;
      cultureW = 25;
      coreValuesW = 25;
    } else if (hasMission && hasVision && !hasCulture) {
      // Case 2: Mission & Vision present, Culture absent (M, V, !C)
      missionW = 35;
      visionW = 35;
      cultureW = 0;
      coreValuesW = 30;
    } else if (hasMission && !hasVision && hasCulture) {
      // Case 3: Mission & Culture present, Vision absent (M, !V, C)
      // ASSUMPTION: Same weights as case 2 (adjust if needed)
      missionW = 35;
      visionW = 0;
      cultureW = 35;
      coreValuesW = 30;
    } else if (!hasMission && hasVision && hasCulture) {
      // Case 4: Vision & Culture present, Mission absent (!M, V, C)
      // ASSUMPTION: Same weights as case 2 & 3 (adjust if needed)
      missionW = 0;
      visionW = 35;
      cultureW = 35;
      coreValuesW = 30;
    } else if (hasMission && !hasVision && !hasCulture) {
      // Case 5: Only Mission present (M, !V, !C)
      // ASSUMPTION: M=60, CoreValues=40 (adjust if needed)
      missionW = 60;
      visionW = 0;
      cultureW = 0;
      coreValuesW = 40;
    } else if (!hasMission && hasVision && !hasCulture) {
      // Case 6: Only Vision present (!M, V, !C)
      // ASSUMPTION: V=60, CoreValues=40 (adjust if needed)
      missionW = 0;
      visionW = 60;
      cultureW = 0;
      coreValuesW = 40;
    } else {
      // Case 7: Only Culture present (!M, !V, C)
      // This is the only remaining possibility if none of the above are true AND
      // we know at least one of M, V, or C MUST be true.
      // ASSUMPTION: C=60, CoreValues=40 (adjust if needed)
      missionW = 0;
      visionW = 0;
      cultureW = 60;
      coreValuesW = 40;
    }

    // --- Update state ---
    setMissionWeight(missionW);
    setVisionWeight(visionW);
    setCultureWeight(cultureW);
    setCoreValuesWeight(coreValuesW);
  }, [
    alignedWiths,
    // Include setters in dependency array if required by your linter rules
    // setMissionWeight,
    // setVisionWeight,
    // setCultureWeight,
    // setCoreValuesWeight,
  ]);

  useEffect(() => {
    console.log("alignedWiths changed to:", alignedWiths);
  }, [alignedWiths]);
  
  useEffect(() => {
    console.log("weights changed to:", missionWeight, visionWeight, cultureWeight);
  }, [missionWeight, visionWeight, cultureWeight]);

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
    alignedWiths,
  };
};
