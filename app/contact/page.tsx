import Link from "next/link";
import PublicFooter from "../../components/PublicFooter";
import PublicNav from "../../components/PublicNav";
import { getPublicCompany } from "../../lib/api/company";

const defaultOfficeLocation = {
  address: "Poblacion, Claveria, Misamis Oriental, Philippines",
  latitude: 8.611484,
  longitude: 124.894067,
};

function buildMapEmbedUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    `${latitude},${longitude}`,
  )}&z=15&output=embed`;
}

export default async function ContactPage() {
  const company = await getPublicCompany();
  const name = company?.name ?? "VelleGrandeur";
  const latitude =
    company?.latitude ??
    (company?.address === defaultOfficeLocation.address
      ? defaultOfficeLocation.latitude
      : null);
  const longitude =
    company?.longitude ??
    (company?.address === defaultOfficeLocation.address
      ? defaultOfficeLocation.longitude
      : null);
  const hasCoordinates = latitude != null && longitude != null;
  const locationQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : company?.address;
  const directionsUrl = locationQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        locationQuery,
      )}`
    : null;

  return (
    <div>
      <PublicNav />
      <main>
        <section className="container py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
              Contact
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Let&apos;s talk about the property you&apos;re looking for.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
              Reach out for property viewings, availability questions,
              partnerships, or tailored real estate guidance.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="card p-6 sm:p-8">
              <h2 className="text-2xl font-semibold">Contact {name}</h2>
              <div className="mt-7 grid gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Email
                  </p>
                  {company?.email ? (
                    <a
                      href={`mailto:${company.email}`}
                      className="mt-2 block text-lg font-semibold text-[var(--accent)]"
                    >
                      {company.email}
                    </a>
                  ) : (
                    <p className="mt-2 text-neutral-600">Available soon</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Phone
                  </p>
                  {company?.phone ? (
                    <a
                      href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}
                      className="mt-2 block text-lg font-semibold text-[var(--accent)]"
                    >
                      {company.phone}
                    </a>
                  ) : (
                    <p className="mt-2 text-neutral-600">Available soon</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Office
                  </p>
                  <p className="mt-2 leading-7 text-neutral-700">
                    {company?.address ?? "Office address available soon"}
                  </p>
                  {directionsUrl ? (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-[var(--accent)] underline"
                    >
                      Get directions
                    </a>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Business hours
                  </p>
                  <p className="mt-2 whitespace-pre-line leading-7 text-neutral-700">
                    {company?.business_hours ??
                      "Viewings and consultations are available by appointment."}
                  </p>
                </div>
              </div>
            </section>

            <section className="card min-h-[430px] overflow-hidden">
              {hasCoordinates ? (
                <iframe
                  title={`${name} office map`}
                  src={buildMapEmbedUrl(latitude, longitude)}
                  className="h-full min-h-[430px] w-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex min-h-[430px] items-center justify-center bg-[var(--accent-soft)] p-8 text-center">
                  <div className="max-w-sm">
                    <p className="text-5xl text-[var(--accent)]" aria-hidden="true">
                      ◇
                    </p>
                    <h2 className="mt-5 text-2xl font-semibold">Map coming soon</h2>
                    <p className="mt-3 leading-7 text-neutral-600">
                      Add the complete office address, latitude, and longitude in
                      Company Settings to display the exact location here.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="container pb-8">
          <div className="rounded-[28px] border border-[var(--line)] bg-white/65 px-6 py-10 text-center sm:px-10">
            <h2 className="text-3xl font-semibold">Prefer to browse first?</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-600">
              Explore the latest published properties, then contact us from any
              listing that interests you.
            </p>
            <Link
              href="/#properties"
              className="button mt-6 inline-block bg-[var(--accent)] text-white"
            >
              Browse properties
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
