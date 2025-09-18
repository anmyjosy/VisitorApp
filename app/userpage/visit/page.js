import { Suspense } from "react";
import VisitPage from "./VisitPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <VisitPage />
    </Suspense>
  );
}
