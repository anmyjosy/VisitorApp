// app/login/otp/page.js
import { Suspense } from "react";
import OtpPage from "./OtpPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <OtpPage />
    </Suspense>
  );
}
