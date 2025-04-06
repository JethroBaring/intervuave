import { InterviewTemplate, Metric, Question, Role } from "@/lib/types";
import { useState, useEffect } from "react";

export const useRoleForm = (initial?: Role | null) => {
  const [role, setRole] = useState<Role>({
    title: "",
    interviewTemplateId: "",
  });

  // When editing, populate form with existing values
  useEffect(() => {
    if (initial) {
      setRole(initial);
    }
  }, [initial]);

  const resetForm = () => {
    setRole({
      title: "",
      interviewTemplateId: "",
    });
  };

  return {
    role,
    setRole,
    resetForm,
  };
};
