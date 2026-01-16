import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-bold text-primary-600">StoryBloom</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-gray-600 mt-2">
          Start creating personalized children&apos;s books
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
