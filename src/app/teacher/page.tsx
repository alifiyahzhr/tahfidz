import Link from "next/link";
import { PinForm } from "./pin-form";

export default function TeacherPinPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-semibold text-zinc-900">
          Teacher Sign-In
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Enter your kelompok&apos;s PIN to continue.
        </p>
        <div className="mt-8">
          <PinForm />
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
