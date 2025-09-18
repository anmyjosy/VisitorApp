import { Suspense } from "react";
import TechPage from "./TechPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <TechPage />
    </Suspense>
  );
}
