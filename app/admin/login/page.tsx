import AdminLoginForm from "../../../components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container flex min-h-screen items-center justify-center py-16">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in with your VelleGrandeur admin credentials.
          </p>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
