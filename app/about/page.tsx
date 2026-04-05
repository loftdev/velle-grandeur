import PublicFooter from "../../components/PublicFooter";
import PublicNav from "../../components/PublicNav";

export default function AboutPage() {
  return (
    <div>
      <PublicNav />
      <main className="container py-16">
        <div className="card p-10">
          <h1 className="text-3xl font-semibold">About VelleGrandeur</h1>
          <p className="mt-4 text-lg text-neutral-700">
            VelleGrandeur is a boutique real estate firm specializing in refined
            residences and distinctive commercial spaces across the Philippines.
          </p>
          <p className="mt-4 text-neutral-700">
            Our team curates each listing for quality, location, and architectural
            excellence, delivering a white-glove experience for every client.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
