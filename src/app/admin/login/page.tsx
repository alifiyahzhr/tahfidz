import Link from "next/link";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-semibold text-zinc-900">
          Admin Sign-In
        </h1>
        <div className="mt-8">
          <LoginForm />
        </div>
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-zinc-500 hover:text-zinc-700"
        >
          &larr; Back
        </Link>
      </div>
    </main>
  );
}
