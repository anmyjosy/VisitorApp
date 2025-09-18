import { Suspense } from "react";
import Userpage from "./Userpage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <Userpage />
    </Suspense>
  );
}
