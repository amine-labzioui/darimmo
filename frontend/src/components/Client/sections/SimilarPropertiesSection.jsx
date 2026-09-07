import SimilarPropertyCard from "./SimilarPropertyCard";

export default function SimilarPropertiesSection({
  annonces,
}) {
  if (!annonces.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-24">

      <div className="flex items-end justify-between mb-12">

        <div>

          <span className="uppercase tracking-[4px] text-sm font-semibold text-[#C2622D]">
            Suggestions
          </span>

          <h2
            className="mt-4 text-5xl text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            Biens similaires
          </h2>

          <p className="mt-4 text-[#6B7280] text-lg">
            D'autres biens qui pourraient vous intéresser.
          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">

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