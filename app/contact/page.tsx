import PublicFooter from "../../components/PublicFooter";
import PublicNav from "../../components/PublicNav";

export default function ContactPage() {
  return (
    <div>
      <PublicNav />
      <main className="container py-16">
        <div className="card p-10">
          <h1 className="text-3xl font-semibold">Contact</h1>
          <p className="mt-4 text-neutral-700">
            Reach us for property viewings, partnerships, and tailored real estate
            advice.
          </p>
          <div className="mt-6 space-y-2 text-sm text-neutral-700">
            <p>Email: info@vellegrandeur.com</p>
            <p>Phone: +63 900 000 0000</p>
            <p>Address: Philippines</p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
