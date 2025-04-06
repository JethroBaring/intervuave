import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign-In | Intervuave",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default function SignIn() {
  return <SignInForm />;
}
