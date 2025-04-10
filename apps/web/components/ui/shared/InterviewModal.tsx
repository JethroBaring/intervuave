import { useState } from "react";
import { useInterviewStore } from "@/stores/useInterviewStore";
import { Modal } from "../modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../button/Button";
import Badge from "../badge/Badge";
import Card from "../common/Card";

const TABS = [
  { label: "Timeline", value: "timeline" },
  { label: "Notification", value: "notification" },
  { label: "Analytics", value: "analytics" },
  { label: "Customers", value: "customers" },
];

export const InterviewTimeline = () => {
  const steps = [
    {
      title: "Interview Scheduled",
      description: "The interview has been scheduled.",
      time: "April 9, 2025",
    },
    {
      title: "Interview Started",
      description: "Candidate started the interview session.",
      time: "April 10, 2025",
    },
    {
      title: "Processing Evaluation",
      description: "The AI is analyzing the interview responses.",
      time: "April 11, 2025",
    },
    {
      title: "Interview Evaluated",
      description: "The final results have been generated.",
      time: "April 12, 2025",
    },
  ];

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

            {/* Special case: Show progress bar if it's Processing step and status is PROCESSING */}
            {step.title === "Processing Evaluation" && (
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: "50%" }}
                  >
                    {/* 50% done for example */}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Processing... 50% completed
                  </p>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

const evaluation = {
  perQuestionResults: {
    q123: {
      responseQuality: {
        speechClarity: 0.74,
        confidence: 0.86,
        emotionalTone: 0.68,
        engagement: 0.8,
        bodyLanguage: 0.75,
      },
      cultureFitComposite: {
        valuesFit: 0.9,
        cultureFit: 0.88,
      },
      feedback:
        "The candidate communicated ideas clearly and demonstrated strong alignment with the company's culture of collaboration.",
    },
    q124: {
      responseQuality: {
        speechClarity: 0.7,
        confidence: 0.82,
        emotionalTone: 0.62,
        engagement: 0.82,
        bodyLanguage: 0.78,
      },
      cultureFitComposite: {
        valuesFit: 0.86,
        visionAlignment: 0.78,
      },
      feedback:
        "The candidate's response was moderately aligned with the company's vision, though some points lacked clarity.",
    },
  },
};

// Dummy functions
const getQuestionTextById = (questionId: string) => {
  const questions: Record<string, string> = {
    q123: "Can you tell us about a time you worked with a team to solve a difficult problem?",
    q124: "How do you align your personal goals with a company's vision?",
  };
  return questions[questionId] || "Unknown Question";
};

const getCandidateTranscriptByQuestionId = (questionId: string) => {
  const transcripts: Record<string, string> = {
    q123: "I once worked with a team to redesign a website under tight deadlines. We collaborated daily and adapted quickly to client feedback.",
    q124: "I set my personal goals by understanding the company's vision first, then aligning my projects towards it.",
  };
  return transcripts[questionId] || "Transcript not available.";
};

const ResponsesTab = () => {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleQuestion = (questionId: string) => {
    setOpenQuestion((prev) => (prev === questionId ? null : questionId));
  };

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(evaluation.perQuestionResults).map(
        ([questionId, result]) => (
          <Card key={questionId}
          >
            {/* Collapse Header */}
            <button
              onClick={() => toggleQuestion(questionId)}
              className="flex w-full justify-between items-center px-4 py-3 text-left text-gray-800 dark:text-white/90 font-semibold"
            >
              <span>Question: {getQuestionTextById(questionId)}</span>
              <svg
                className={`h-5 w-5 transform transition-transform ${
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
            </button>

            {/* Collapse Content */}
            {openQuestion === questionId && (
              <div className="px-4 pb-4">
                {/* Candidate Response */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Candidate Response:</strong>{" "}
                  {getCandidateTranscriptByQuestionId(questionId)}
                </p>

                {/* Response Quality */}
                <div className="mb-4">
                  <h5 className="text-base font-semibold text-gray-700 dark:text-white/80 mb-1">
                    Response Quality
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result.responseQuality).map(
                      ([metric, score]) => (
                        <div key={metric}>
                          <p className="text-xs text-gray-500 capitalize">
                            {metric}
                          </p>
                          <p className="text-sm font-medium">
                            {(score * 100).toFixed(0)}%
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Culture Fit */}
                <div className="mb-4">
                  <h5 className="text-base font-semibold text-gray-700 dark:text-white/80 mb-1">
                    Culture Fit Composite
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result.cultureFitComposite).map(
                      ([metric, score]) => (
                        <div key={metric}>
                          <p className="text-xs text-gray-500 capitalize">
                            {metric}
                          </p>
                          <p className="text-sm font-medium">
                            {(score * 100).toFixed(0)}%
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Feedback */}
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  Feedback: {result.feedback}
                </p>
              </div>
            )}
          </Card>
        )
      )}
    </div>
  );
};

const InterviewModal = () => {
  // const { isCardModalOpen, openCardModal, closeCardModal } =
    // useInterviewStore();

  const isCardModalOpen = useInterviewStore((state) => state.isCardModalOpen)
  const closeCardModal = useInterviewStore((state) => state.closeCardModal)
  const selectedCandidate = useInterviewStore((state) => state.selectedCandidate)

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "timeline":
        return <InterviewTimeline />

      case "notification":
        return <ResponsesTab />;
      case "analytics":
        return (
          <>
            <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
              Analytics
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analytics content goes here.
            </p>
          </>
        );
      case "customers":
        return (
          <>
            <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
              Customers
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customers content goes here.
            </p>
          </>
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
            <Button size="sm" variant="outline">Expire Link</Button>
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
        break;
      case "EXPIRED":
        break
      default:
        break;
    }
  }

  return (
    <Modal
      isOpen={isCardModalOpen}
      onClose={closeCardModal}
      className="max-w-[700px] m-4 min-h-[700px]"
    >
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Candidate Interview
          </h4>
        </div>

        <div className="mx-2 my-5 flex">
          <div className="h-[65px] w-[65px] rounded-full bg-gray-500 flex items-center justify-center text-2xl text-white">
            JB
          </div>
          <div className="flex justify-between w-full">
            <div className="flex flex-col justify-center">
              <h4 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white/90">
                {selectedCandidate?.candidate.firstName} {selectedCandidate?.candidate.lastName}
              </h4>
              <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                {selectedCandidate?.interview.position}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Badge>DRAFT</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="px-2">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="-mb-px flex space-x-2 overflow-x-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
                {TABS.map((tab) => (
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
            <div className="pt-4 dark:border-gray-800">
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
