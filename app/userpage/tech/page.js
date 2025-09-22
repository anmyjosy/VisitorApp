import { Suspense } from "react";
import TechPage from "./TechPage";
import LoadingSpinner from "../../userpage/LoadingSpinner";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TechPage />
    </Suspense>
  );
}
