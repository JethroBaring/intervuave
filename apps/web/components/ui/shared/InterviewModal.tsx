import { useEffect, useState } from "react";
import { useInterviewStore } from "@/stores/useInterviewStore";
import { Modal } from "../modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../button/Button";
import Badge from "../badge/Badge";
import Card from "../common/Card";
import moment from "moment";
import api from "@/lib/axios";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { endpoints } from "@/lib/endpoint";
import {
  ChartPie,
  MessageSquare,
  PieChart,
  ThumbsUp,
  UserCheck,
  CheckCircle2,
  XCircle,
  BarChart2,
  Users,
  Star,
  MessageCircle,
} from "lucide-react";
import BarChartHorizontal from "../charts/bar/BarChartHorizontal";
import PieChartComponent from "../charts/pie/PieChart";
import DonutChartWithCenter from "../charts/pie/PieChart";

export enum InterviewStatusNum {
  DRAFT = 0,
  PENDING = 1,
  IN_PROGRESS = 2,
  SUBMITTED = 3,
  PROCESSING = 4,
  EVALUATION = 5,
  EVALUATED = 6,
}

const TABS = [
  { label: "Timeline", value: "timeline", minStatus: InterviewStatusNum.DRAFT },
  {
    label: "Interview Video",
    value: "notification",
    minStatus: InterviewStatusNum.SUBMITTED,
  },
  {
    label: "Per-Question Evaluation",
    value: "analytics",
    minStatus: InterviewStatusNum.EVALUATED,
  },
  {
    label: "Final Evaluation",
    value: "customers",
    minStatus: InterviewStatusNum.EVALUATED,
  },
];

export const InterviewTimeline = ({ steps }: { steps: any[] }) => {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start relative pb-8">
          {/* Vertical line */}
          {index !== steps.length - 1 && (
            <span className="absolute left-3 top-5 h-full w-0.5 bg-gray-300 dark:bg-gray-700"></span>
          )}

          {/* Step Circle */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-white text-xs dark:bg-brand-400 z-10">
            {index + 1}
          </div>

          {/* Step Content */}
          <div className="ml-6">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {step.title}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">{step.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ResponseQuality {
  confidence: number;
  engagement: number;
  bodyLanguage: number;
  emotionalTone: number;
  speechClarity: number;
}

interface CultureFitComposite {
  valuesFit?: number;
  visionAlignment?: number;
  missionAlignment?: number;
  cultureFit?: number;
}

interface PerQuestionResult {
  feedback: string;
  responseQuality: ResponseQuality;
  cultureFitComposite: CultureFitComposite;
}

interface Evaluation {
  perQuestionResults: Record<string, PerQuestionResult>;
  // ... other properties
}

interface Response {
  id: string;
  questionId: string;
  transcript: string;
  metrics: ResponseQuality;
  question: {
    questionText: string;
    coreValues: string;
    alignedWith: string;
  };
}

const ResponsesTab = ({
  evaluation,
  responses,
}: {
  evaluation: Evaluation;
  responses: Response[];
}) => {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleQuestion = (questionId: string) => {
    setOpenQuestion((prev) => (prev === questionId ? null : questionId));
  };

  const calculateAverage = (values: number[]): number => {
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(evaluation.perQuestionResults).map(
        ([questionId, result]: [string, PerQuestionResult], index) => {
          const response = responses.find((r) => r.questionId === questionId);
          return (
            <Card key={questionId}>
              {/* Collapse Header */}
              <button
                onClick={() => toggleQuestion(questionId)}
                className="flex w-full justify-between items-start px-4 py-3 text-left text-gray-800 dark:text-white/90 font-semibold h-[48px]"
              >
                <span
                  className={`${openQuestion === questionId ? "" : "truncate"}`}
                >
                  {index + 1}. {response?.question.questionText}
                </span>
                <div className={`h-full flex justify-center items-center `}>
                  <svg
                    className={`h-4 w-4 transform transition-transform ${
                      openQuestion === questionId ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Collapse Content */}
              {openQuestion === questionId && (
                <div className="px-4 pb-4">
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 capitalize">
                          Evaluates
                        </p>
                        <p className="text-sm font-medium">
                          {response?.question.coreValues}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 capitalize">
                          Aligned With
                        </p>
                        <p className="text-sm font-medium">
                          {response?.question.alignedWith
                            .toLowerCase()
                            .replace(/^\w/, (c: string) => c.toUpperCase())}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <Label>Candidate Response</Label>
                      <Card className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {response?.transcript}
                      </Card>
                    </div>
                    <div>
                      <Label>AI Feedback</Label>
                      <Card className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {result.feedback}
                      </Card>
                    </div>
                    <div>
                      <Label className="flex justify-between">
                        <span>Response Quality</span>
                        <span>
                          {(
                            calculateAverage(
                              Object.values(result.responseQuality)
                            ) * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </Label>
                      <Card className="p-3 flex flex-col gap-5 text-gray-500">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                            Confidence
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${parseFloat(
                                  (
                                    result.responseQuality.confidence * 100
                                  ).toFixed(2)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-12 text-sm font-medium text-right">
                            {parseFloat(
                              (result.responseQuality.confidence * 100).toFixed(
                                2
                              )
                            )}
                            %
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                            Engagement
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${parseFloat(
                                  (
                                    result.responseQuality.engagement * 100
                                  ).toFixed(2)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-12 text-sm font-medium text-right">
                            {parseFloat(
                              (result.responseQuality.engagement * 100).toFixed(
                                2
                              )
                            )}
                            %
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                            Body Language
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${parseFloat(
                                  (
                                    result.responseQuality.bodyLanguage * 100
                                  ).toFixed(2)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-12 text-sm font-medium text-right">
                            {parseFloat(
                              (
                                result.responseQuality.bodyLanguage * 100
                              ).toFixed(2)
                            )}
                            %
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                            Emotional Tone
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${parseFloat(
                                  (
                                    result.responseQuality.emotionalTone * 100
                                  ).toFixed(2)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-12 text-sm font-medium text-right">
                            {parseFloat(
                              (
                                result.responseQuality.emotionalTone * 100
                              ).toFixed(2)
                            )}
                            %
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                            Speech Clarity
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${parseFloat(
                                  (
                                    result.responseQuality.speechClarity * 100
                                  ).toFixed(2)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-12 text-sm font-medium text-right">
                            {parseFloat(
                              (
                                result.responseQuality.speechClarity * 100
                              ).toFixed(2)
                            )}
                            %
                          </div>
                        </div>
                      </Card>
                    </div>
                    <div>
                      <Label className="flex justify-between">
                        <span>Culture Fit Composite</span>
                        <span>
                          {(
                            calculateAverage(
                              Object.values(result.cultureFitComposite).filter(
                                (v): v is number => v !== undefined
                              )
                            ) * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </Label>
                      <Card className="p-3 flex flex-col gap-5 text-gray-500">
                        {result.cultureFitComposite.visionAlignment && (
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                              Vision Alignment
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${parseFloat(
                                    (
                                      result.cultureFitComposite
                                        .visionAlignment * 100
                                    ).toFixed(2)
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 text-sm font-medium text-right">
                              {parseFloat(
                                (
                                  result.cultureFitComposite.visionAlignment *
                                  100
                                ).toFixed(2)
                              )}
                              %
                            </div>
                          </div>
                        )}
                        {result.cultureFitComposite.missionAlignment && (
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                              Mission Alignment
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${parseFloat(
                                    (
                                      result.cultureFitComposite
                                        .missionAlignment * 100
                                    ).toFixed(2)
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 text-sm font-medium text-right">
                              {parseFloat(
                                (
                                  result.cultureFitComposite.missionAlignment *
                                  100
                                ).toFixed(2)
                              )}
                              %
                            </div>
                          </div>
                        )}
                        {result.cultureFitComposite.cultureFit && (
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                              Culture Alignment
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${parseFloat(
                                    (
                                      result.cultureFitComposite.cultureFit *
                                      100
                                    ).toFixed(2)
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 text-sm font-medium text-right">
                              {parseFloat(
                                (
                                  result.cultureFitComposite.cultureFit * 100
                                ).toFixed(2)
                              )}
                              %
                            </div>
                          </div>
                        )}
                        {result.cultureFitComposite.valuesFit && (
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                              Core Values Alignment
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${parseFloat(
                                    (
                                      result.cultureFitComposite.valuesFit * 100
                                    ).toFixed(2)
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 text-sm font-medium text-right">
                              {parseFloat(
                                (
                                  result.cultureFitComposite.valuesFit * 100
                                ).toFixed(2)
                              )}
                              %
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        }
      )}
    </div>
  );
};

const EvaluationTab = ({ evaluation }: { evaluation: any }) => {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const formatFeedback = (feedback: string) => {
    // Replace decimal numbers with percentages
    return feedback.replace(/\b0\.(\d+)\b/g, (match, p1) => {
      const percentage = Math.round(parseFloat(`0.${p1}`) * 100);
      return `${percentage}%`;
    });
  };

  const toggleQuestion = (id: string) => {
    setOpenQuestion((prev) => (prev === id ? null : id));
  };

  const cards = [
    {
      id: "responseQuality",
      label: "Response Quality",
      icon: <MessageCircle className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "cultureFit",
      label: "Culture Fit",
      icon: <Users className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "valuesBreakdown",
      label: "Values Breakdown",
      icon: <Star className="h-4 w-4 text-amber-500" />,
    },
    {
      id: "companyFeedback",
      label: "Company Feedback",
      icon: <MessageSquare className="h-4 w-4 text-green-500" />,
    },
  ];

  const cultureFitData = [
    {
      label: "Mission Alignment",
      value: evaluation.cultureFitComposite.missionAlignment * 100,
    },
    {
      label: "Vision Alignment",
      value: evaluation.cultureFitComposite.visionAlignment * 100,
    },
    {
      label: "Culture Alignment",
      value: evaluation.cultureFitComposite.cultureFit * 100,
    },
    {
      label: "Values Fit",
      value: evaluation.cultureFitComposite.valuesFit * 100,
    },
  ];

  const perValueBreakdownData = Object.entries(
    evaluation.perValueBreakdown || {}
  ).map(([value, score]) => ({
    label: value,
    value: (score as number) * 100,
  }));

  const filteredCultureFitData = cultureFitData.filter(
    (item) =>
      item.value !== undefined && item.value !== null && item.value !== 0
  );

  const getPercentage = (id: string) => {
    switch (id) {
      case "responseQuality":
        return `${(evaluation.responseQualityAverage * 100).toFixed(1)}%`;

      case "cultureFit":
        return `${(evaluation.cultureFitCompositeAverage * 100).toFixed(1)}%`;

      case "valuesBreakdown":
        return `${(evaluation.cultureFitComposite.valuesFit * 100).toFixed(
          1
        )}%`;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="px-4 py-3 ">
        <div className="flex w-full justify-between items-center text-left text-gray-800 dark:text-white/90 font-semibold">
          <div className="flex items-center gap-2">
            {/* <ThumbsUp className="h-4 w-4 text-brand-400" /> */}
            <span>Evaluation Summary</span>
          </div>
        </div>
        <div className="px-4 pb-4 relative">
          <div className="flex items-center justify-center overflow-hidden">
            <DonutChartWithCenter
              centerLabel="Hello World"
              labels={["Response Quality", "Culture Fit"]}
              series={[30, 70]} // 30% Response Quality, 70% Culture Fit
              height={250}
            />
            <div className="absolute flex flex-col items-center justify-center bottom-1/2">
              <div className="text-2xl font-bold text-primary">
                {(evaluation.overallFitScore * 100).toFixed(2)}%
              </div>{" "}
              {/* 🎯 Your big overall fit score */}
              <div
                className={`text-sm font-medium ${
                  evaluation.aiDecision?.toLowerCase() === "approved"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {evaluation.aiDecision?.toLowerCase() === "approved"
                  ? "Approved"
                  : "Rejected"}
              </div>{" "}
              {/* 🎯 Your decision */}
            </div>
          </div>
        </div>
        <div>
          <Label>AI Feedback</Label>
          <Card className="p-3 text-sm text-gray-600 dark:text-gray-300">
            {formatFeedback(evaluation.aiFeedback)}
          </Card>
        </div>
      </Card>
      <Card>
        <button
          onClick={() => toggleQuestion("detailedEvaluation")}
          className="flex w-full justify-between items-center px-4 py-3 text-left text-gray-800 dark:text-white/90 font-semibold"
        >
          <div className="flex items-center gap-2">
            <span>Detailed Evaluation</span>
          </div>
          <div className="flex items-center">
            <svg
              className={`h-4 w-4 transform transition-transform ${
                openQuestion === "detailedEvaluation" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
        {openQuestion === "detailedEvaluation" && (
          <div className="px-4 pb-4 flex flex-col gap-4">
            <div>
              <Label className="flex justify-between">
                <span>Response Quality</span>
                <span>{getPercentage("responseQuality")}</span>
              </Label>
              <Card className="p-3 flex flex-col gap-5 text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                    Confidence
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${parseFloat(
                          (evaluation.responseQuality.confidence * 100).toFixed(
                            2
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">
                    {parseFloat(
                      (evaluation.responseQuality.confidence * 100).toFixed(2)
                    )}
                    %
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                    Engagement
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${parseFloat(
                          (evaluation.responseQuality.engagement * 100).toFixed(
                            2
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">
                    {parseFloat(
                      (evaluation.responseQuality.engagement * 100).toFixed(2)
                    )}
                    %
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                    Body Language
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${parseFloat(
                          (
                            evaluation.responseQuality.bodyLanguage * 100
                          ).toFixed(2)
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">
                    {parseFloat(
                      (evaluation.responseQuality.bodyLanguage * 100).toFixed(2)
                    )}
                    %
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                    Emotional Tone
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${parseFloat(
                          (
                            evaluation.responseQuality.emotionalTone * 100
                          ).toFixed(2)
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">
                    {parseFloat(
                      (evaluation.responseQuality.emotionalTone * 100).toFixed(
                        2
                      )
                    )}
                    %
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                    Speech Clarity
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${parseFloat(
                          (
                            evaluation.responseQuality.speechClarity * 100
                          ).toFixed(2)
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">
                    {parseFloat(
                      (evaluation.responseQuality.speechClarity * 100).toFixed(
                        2
                      )
                    )}
                    %
                  </div>
                </div>
              </Card>
              {/* <BarChartHorizontal
                          categories={[
                            "Confidence",
                            "Engagement",
                            "Body Language",
                            "Emotional Tone",
                            "Speech Clarity",
                          ]}
                          data={[
                            parseFloat((result.responseQuality.confidence * 100).toFixed(2)),
                            parseFloat((result.responseQuality.engagement * 100).toFixed(2)),
                            parseFloat((result.responseQuality.bodyLanguage * 100).toFixed(2)),
                            parseFloat((result.responseQuality.emotionalTone * 100).toFixed(2)),
                            parseFloat((result.responseQuality.speechClarity * 100).toFixed(2)),
                          ]}
                          height={70 * 5}
                        /> */}
            </div>
            <div>
              <Label className="flex justify-between">
                <span>Culture Fit Composite</span>
                <span>{getPercentage("cultureFit")}</span>
              </Label>
              <Card className="p-3 flex flex-col gap-5 text-gray-500">
                {evaluation.cultureFitComposite.visionAlignment && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                      Vision Alignment
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${parseFloat(
                            (
                              evaluation.cultureFitComposite.visionAlignment *
                              100
                            ).toFixed(2)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {parseFloat(
                        (
                          evaluation.cultureFitComposite.visionAlignment * 100
                        ).toFixed(2)
                      )}
                      %
                    </div>
                  </div>
                )}
                {evaluation.cultureFitComposite.missionAlignment && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                      Mission Alignment
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${parseFloat(
                            (
                              evaluation.cultureFitComposite.missionAlignment *
                              100
                            ).toFixed(2)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {parseFloat(
                        (
                          evaluation.cultureFitComposite.missionAlignment * 100
                        ).toFixed(2)
                      )}
                      %
                    </div>
                  </div>
                )}
                {evaluation.cultureFitComposite.cultureFit && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                      Culture Alignment
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${parseFloat(
                            (
                              evaluation.cultureFitComposite.cultureFit * 100
                            ).toFixed(2)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {parseFloat(
                        (
                          evaluation.cultureFitComposite.cultureFit * 100
                        ).toFixed(2)
                      )}
                      %
                    </div>
                  </div>
                )}
                {evaluation.cultureFitComposite.valuesFit && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                      Core Values Alignment
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${parseFloat(
                            (
                              evaluation.cultureFitComposite.valuesFit * 100
                            ).toFixed(2)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {parseFloat(
                        (
                          evaluation.cultureFitComposite.valuesFit * 100
                        ).toFixed(2)
                      )}
                      %
                    </div>
                  </div>
                )}
              </Card>
            </div>
            <div>
              <Label className="flex justify-between">
                <span>Values Breakdown</span>
                <span>{getPercentage("valuesBreakdown")}</span>
              </Label>
              <Card className="p-3 flex flex-col gap-5 text-gray-500">
                {perValueBreakdownData
                  .filter((item) => item.value > 0)
                  .map((item) => (
                    <div className="flex items-center gap-3" key={item.label}>
                      <div className="text-sm font-medium min-w-[100px] max-w-[100px] truncate">
                        {item.label}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${parseFloat(item.value.toFixed(2))}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm font-medium text-right">
                        {parseFloat(item.value.toFixed(2))}%
                      </div>
                    </div>
                  ))}
              </Card>
            </div>
          </div>
        )}
      </Card>
      <Card>
        <button
          onClick={() => toggleQuestion("companyFeedback")}
          className="flex w-full justify-between items-center px-4 py-3 text-left text-gray-800 dark:text-white/90 font-semibold"
        >
          <div className="flex items-center gap-2">
            <span>Company Feedback</span>
          </div>
          <div className="flex items-center">
            <svg
              className={`h-4 w-4 transform transition-transform ${
                openQuestion === "detailedEvaluation" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
        {openQuestion === "companyFeedback" && (
          <div className="px-4 pb-4 flex flex-col gap-4">
            
          </div>
        )}
      </Card>
    </div>
  );
};

const getTimeline = (interview: any) => {
  const createdAt = {
    title: "Interview Created",
    description: "The interview has been created.",
    time: moment(interview?.createdAt).format("MMMM D, YYYY - h:mm A"),
  };
  const emailSentAt = {
    title: "Interview Email Sent",
    description: "The interview email has been sent to the candidate.",
    time: moment(interview?.emailSentAt).format("MMMM D, YYYY - h:mm A"),
  };

  const interviewStartedAt = {
    title: "Interview Started",
    description: "The interview has started.",
    time: moment(interview?.interviewStartedAt).format("MMMM D, YYYY - h:mm A"),
  };

  const submittedAt = {
    title: "Interview Completed",
    description: "The interview has been completed.",
    time: moment(interview?.submittedAt).format("MMMM D, YYYY - h:mm A"),
  };

  const processedAt = {
    title: "Interview Processed",
    description: "The interview has been processed.",
    time: moment(interview?.processedAt).format("MMMM D, YYYY - h:mm A"),
  };

  const evaluatedAt = {
    title: "Interview Evaluated",
    description: "The interview has been evaluated.",
    time: moment(interview?.evaluatedAt).format("MMMM D, YYYY - h:mm A"),
  };

  return [
    ...(interview?.createdAt ? [createdAt] : []),
    ...(interview?.emailSentAt ? [emailSentAt] : []),
    ...(interview?.interviewStartedAt ? [interviewStartedAt] : []),
    ...(interview?.submittedAt ? [submittedAt] : []),
    ...(interview?.processedAt ? [processedAt] : []),
    ...(interview?.evaluatedAt ? [evaluatedAt] : []),
  ];
};

// Add color generation utility function
const generateColorFromName = (name: string) => {
  // List of visually appealing colors
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-violet-500",
  ];

  // Simple hash function to convert name to a number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to select a color from the array
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

const InterviewModal = () => {
  // const { isCardModalOpen, openCardModal, closeCardModal } =
  // useInterviewStore();

  const isCardModalOpen = useInterviewStore((state) => state.isCardModalOpen);
  const closeCardModal = useInterviewStore((state) => state.closeCardModal);
  const selectedCandidate = useInterviewStore(
    (state) => state.selectedCandidate
  );

  const [activeTab, setActiveTab] = useState("timeline");

  // const getInterviewModalStyle = () => {
  //   switch (selectedCandidate?.interview?.status) {
  //     case "DRAFT":
  //       return "bg-gray-100 dark:bg-gray-800";
  //     case "PENDING":
  //       return "bg-blue-100 dark:bg-blue-800";
  //     case "SUBMITTED":
  //       return "bg-green-100 dark:bg-green-800";
  //     case "PROCESSING":
  //       return "bg-red-100 dark:bg-red-800";
  //     case "EVALUATED":
  //       return "bg-yellow-100 dark:bg-yellow-800";
  //     case "EXPIRED":
  //       return "bg-purple-100 dark:bg-purple-800";
  //     default:
  //       return "bg-gray-100 dark:bg-gray-800";
  //   }
  // };

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const companyId = useCompanyStore((state) => state.companyId);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (activeTab !== "notification" || !selectedCandidate?.interview.id)
        return;

      setIsVideoLoading(true);
      try {
        const res = await api.get(
          `${endpoints.interviews["view-url"](
            companyId,
            selectedCandidate?.interview.id
          )}`
        );
        setVideoUrl(res.data.viewUrl); // assuming backend returns { url: "https://..." }
      } catch (error) {
        console.error("Failed to fetch video URL:", error);
        setVideoUrl(null);
      } finally {
        setIsVideoLoading(false);
      }
    };

    fetchVideoUrl();
  }, [activeTab, selectedCandidate?.interview?.id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "timeline":
        return (
          <InterviewTimeline
            steps={getTimeline(selectedCandidate?.interview)}
          />
        );

      case "notification":
        if (isVideoLoading) {
          return (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Loading video...
            </div>
          );
        }

        if (!videoUrl) {
          return (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No video available.
            </div>
          );
        }

        return (
          <div className="flex justify-center h-[450px]">
            <video
              controls
              className="max-w-full rounded-lg shadow-lg object-cover"
            >
              <source src={videoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "analytics":
        return (
          <ResponsesTab
            evaluation={selectedCandidate?.interview?.evaluation}
            responses={selectedCandidate?.interview?.responses}
          />
        );
      case "customers":
        return (
          <EvaluationTab evaluation={selectedCandidate?.interview.evaluation} />
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (selectedCandidate?.interview?.status) {
      case "DRAFT":
        return (
          <div className="flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline">
              Close
            </Button>
            <Button size="sm">Send Interview Link</Button>
          </div>
        );
      case "PENDING":
        return (
          <div className="flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline">
              Close
            </Button>
            <Button size="sm" variant="outline">
              Expire Link
            </Button>
            <Button size="sm">Send Reminder</Button>
          </div>
        );
      case "IN_PROGRESS":
      case "SUBMITTED":
      case "PROCESSING":
        return (
          <div className="flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline">
              Close
            </Button>
          </div>
        );
      case "EVALUATED":
        return (
          <div className="flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline">
              Close
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                const x = await api.post(
                  `interviews/${selectedCandidate.interview.id}/evaluation/reprocess`
                );
                console.log(x);
              }}
            >
              Reprocess
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                const x = await api.post(
                  `interviews/${selectedCandidate.interview.id}/evaluation/reevaluate`
                );
                console.log(x);
              }}
            >
              Reevaluate
            </Button>
          </div>
        );
      case "EXPIRED":
        return (
          <div className="flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline">
              Close
            </Button>
          </div>
        );
      default:
        break;
    }
  };

  return (
    <Modal
      isOpen={isCardModalOpen}
      onClose={() => {
        closeCardModal();
        setActiveTab("timeline");
      }}
      className="max-w-[700px] m-4 min-h-[700px]"
    >
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Candidate Interview
          </h4>
        </div>

        <div className="mx-2 my-5 flex">
          <div className="flex-shrink-0">
            <div
              className={`h-[65px] w-[65px] rounded-full flex items-center justify-center text-2xl text-white aspect-square ${generateColorFromName(
                selectedCandidate?.candidate.firstName +
                  selectedCandidate?.candidate.lastName
              )}`}
            >
              {getInitials(
                selectedCandidate?.candidate.firstName,
                selectedCandidate?.candidate.lastName
              )}
            </div>
          </div>
          <div className="flex justify-between w-full">
            <div className="flex flex-col justify-center">
              <h4 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white/90">
                {selectedCandidate?.candidate.firstName}{" "}
                {selectedCandidate?.candidate.lastName}
              </h4>
              <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                {selectedCandidate?.interview.position}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Badge
                variant="light"
                color={selectedCandidate?.interview?.status?.toLowerCase()}
              >
                {selectedCandidate?.interview.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 h-full">
          <div className="px-2">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="-mb-px flex space-x-2 overflow-x-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
                {TABS.filter(
                  (tab) =>
                    InterviewStatusNum[
                      selectedCandidate?.interview
                        .status as keyof typeof InterviewStatusNum
                    ] >= tab.minStatus!
                ).map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`inline-flex items-center border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                      activeTab === tab.value
                        ? "text-brand-500 dark:text-brand-400 border-brand-500 dark:border-brand-400"
                        : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="pt-4 dark:border-gray-800 overflow-auto min-h-[500px] max-h-[500px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
              {renderTabContent()}
            </div>
          </div>
          {renderFooter()}
        </div>
      </div>
    </Modal>
  );
};

export default InterviewModal;
