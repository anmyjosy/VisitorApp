import { Suspense } from "react";
import Userpage from "./Userpage";
import LoadingSpinner from "../userpage/LoadingSpinner";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Userpage />
    </Suspense>
  );
}
