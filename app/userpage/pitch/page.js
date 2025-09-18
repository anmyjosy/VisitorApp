import { Suspense } from "react";
import BusinessPitchPage from "./BusinessPitchPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <BusinessPitchPage />
    </Suspense>
  );
}
