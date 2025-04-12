import Interviewer from "@/components/interviewer/Interviewer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Interview | Intervuave",
};
const Page = () => {
  return <Interviewer />;
};

export default Page;
