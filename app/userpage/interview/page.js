import { Suspense } from "react";
import InterviewPage from "./InterviewPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <InterviewPage />
    </Suspense>
  );
}
