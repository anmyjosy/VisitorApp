import { Suspense } from "react";
import InterviewPage from "./InterviewPage";
import LoadingSpinner from "../../userpage/LoadingSpinner";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InterviewPage />
    </Suspense>
  );
}
