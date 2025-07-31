import { Suspense } from "react";
import ResetPassword from "./ResetPassword";
import { ResetPasswordSkeleton } from "./ResetPasswordSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPassword />
    </Suspense>
  );
}
