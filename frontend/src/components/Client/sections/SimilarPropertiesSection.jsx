import SimilarPropertyCard from "./SimilarPropertyCard";

export default function SimilarPropertiesSection({
  annonces,
}) {
  if (!annonces.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-12">

      <div className="flex items-end justify-between mb-6">

        <div>

          <span className="uppercase tracking-wide text-[11px] font-semibold text-[#C2622D]">
            Suggestions
          </span>

          <h2
            className="mt-1 text-lg text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            Biens similaires
          </h2>

          <p className="mt-1 text-[#6B7280] text-sm">
            D'autres biens qui pourraient vous intéresser.
          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">

        {annonces.map((annonce) => (

          <SimilarPropertyCard
            key={annonce.id}
            annonce={annonce}
          />

        ))}

      </div>

    </section>
  );
}