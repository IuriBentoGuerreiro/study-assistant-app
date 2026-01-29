import ResetPasswordForm from "@/src/components/ResetPasswordForm/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  );
}
