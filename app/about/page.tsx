import Link from "next/link";
import PublicFooter from "../../components/PublicFooter";
import PublicNav from "../../components/PublicNav";
import { getPublicCompany } from "../../lib/api/company";

const services = [
  {
    title: "Curated properties",
    description:
      "A focused collection of residences, land, and commercial spaces selected for quality and location.",
  },
  {
    title: "Local guidance",
    description:
      "Clear context on neighborhoods, property types, and the practical details behind each opportunity.",
  },
  {
    title: "Personal attention",
    description:
      "Responsive support designed around your priorities, from initial questions to property viewings.",
  },
];

export default async function AboutPage() {
  const company = await getPublicCompany();
  const name = company?.name ?? "VelleGrandeur";

  return (
    <div>
      <PublicNav />
      <main>
        <section className="container grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div className="card flex min-h-72 items-center justify-center overflow-hidden bg-[var(--accent-soft)] p-8">
            {company?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo_url}
                alt={`${name} logo`}
                className="max-h-48 max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-[var(--accent)]">
                <p className="text-7xl font-semibold" aria-hidden="true">
                  {name.charAt(0).toUpperCase()}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em]">
                  Philippine real estate
                </p>
              </div>
            )}
          </div>
          <div>
            <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
              About us
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Thoughtful property guidance, shaped around what matters to you.
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-700">
              {company?.about ??
                `${name} helps clients discover carefully selected property opportunities across the Philippines.`}
            </p>
            <p className="mt-4 leading-7 text-neutral-600">
              We focus on making the search clearer: presenting useful details,
              answering practical questions, and helping each client move forward
              with confidence.
            </p>
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-white/55">
          <div className="container py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                What we offer
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                A focused and personal way to explore property.
              </h2>
            </div>
            <div className="mt-9 grid gap-6 md:grid-cols-3">
              {services.map((service, index) => (
                <article key={service.title} className="card p-6">
                  <p className="text-sm font-semibold text-[var(--accent)]">
                    0{index + 1}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
                  <p className="mt-3 leading-7 text-neutral-600">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Our approach
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Quality over volume, clarity over pressure.
            </h2>
          </div>
          <div>
            <p className="leading-8 text-neutral-700">
              Every property conversation starts with understanding your needs.
              We prioritize relevant options, transparent information, and
              respectful follow-through rather than an overwhelming catalog.
            </p>
            <Link
              href="/contact"
              className="button mt-6 inline-block bg-[var(--accent)] text-white"
            >
              Talk to our team
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
