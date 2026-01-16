import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-bold text-primary-600">StoryBloom</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600 mt-2">
          Sign in to continue creating magical stories
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
