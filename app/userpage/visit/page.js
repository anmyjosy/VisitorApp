import { Suspense } from "react";
import VisitPage from "./VisitPage";
import LoadingSpinner from "../../userpage/LoadingSpinner";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VisitPage />
    </Suspense>
  );
}
