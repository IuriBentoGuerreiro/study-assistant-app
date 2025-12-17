import LoginForm from "@/src/components/login/loginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Assistente de Estudos
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Seu Assistente de Estudos
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
