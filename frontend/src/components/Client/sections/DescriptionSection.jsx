import {
  MapContainer,
  TileLayer,
  Marker,
} from "react-leaflet";
import {
  CheckCircle2,
  Home,
  MapPin,
  Building2,
  Ruler,
} from "lucide-react";
import { Map } from "lucide-react";

export default function DescriptionSection({ annonce }) {
  const pointsForts = [];

  if (annonce.has_pool) pointsForts.push("Piscine");
  if (annonce.has_garden) pointsForts.push("Jardin");
  if (annonce.has_parking) pointsForts.push("Parking");
  if (annonce.is_furnished) pointsForts.push("Bien meublé");

  return (
    <div className="space-y-8">

      {/* DESCRIPTION */}

      <section className="rounded-[30px] bg-white border border-[#ECE7DD] shadow-lg p-8">

        <span className="uppercase tracking-[4px] text-xs font-semibold text-[#C2622D]">
          Description
        </span>

        <h2
          className="mt-4 text-3xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          À propos de ce bien
        </h2>

        <div className="mt-8 space-y-5 text-[17px] leading-8 text-[#4B5563] whitespace-pre-line">

          {annonce.description}

        </div>

      </section>

      {/* POINTS FORTS */}

      <section className="rounded-[30px] bg-white border border-[#ECE7DD] shadow-lg p-8">

        <span className="uppercase tracking-[4px] text-xs font-semibold text-[#C2622D]">
          Points forts
        </span>

        <div className="grid md:grid-cols-2 gap-4 mt-8">

          {pointsForts.length ? (
            pointsForts.map((item) => (
              <div
                key={item}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-[#F7FBF9]
                  px-5
                  py-4
                "
              >
                <CheckCircle2
                  size={20}
                  className="text-[#047857]"
                />

                <span className="font-medium">
                  {item}
                </span>

              </div>
            ))
          ) : (
            <p className="text-[#6B7280]">
              Aucun équipement renseigné.
            </p>
          )}

        </div>

      </section>

      {/* INFORMATIONS */}

      <section className="rounded-[30px] bg-white border border-[#ECE7DD] shadow-lg p-8">

        <span className="uppercase tracking-[4px] text-xs font-semibold text-[#C2622D]">
          Informations
        </span>

        <div className="grid md:grid-cols-2 gap-5 mt-8">

          <InfoCard
            icon={Home}
            label="Transaction"
            value={annonce.transaction_type}
          />

          <InfoCard
            icon={Building2}
            label="Type"
            value={annonce.property_type}
          />

          <InfoCard
            icon={MapPin}
            label="Ville"
            value={annonce.city}
          />

          <InfoCard
            icon={MapPin}
            label="Quartier"
            value={annonce.neighborhood || "-"}
          />

          <InfoCard
            icon={Ruler}
            label="Surface"
            value={`${annonce.surface} m²`}
          />

          <InfoCard
            icon={Building2}
            label="Statut"
            value={annonce.status}
          />

        </div>

      </section>
      {/* LOCALISATION */}

<section className="rounded-[30px] bg-white border border-[#ECE7DD] shadow-lg p-8">

  <span className="uppercase tracking-[4px] text-xs font-semibold text-[#C2622D]">
    Localisation
  </span>

  <h2
    className="mt-4 text-3xl text-[#1C2520]"
    style={{
      fontFamily: "'Fraunces', serif",
      fontWeight: 600,
    }}
  >
    Où se situe ce bien ?
  </h2>

  {annonce.latitude && annonce.longitude ? (

    <div className="mt-8 overflow-hidden rounded-[24px] border border-[#ECE7DD]">

  <MapContainer
    center={[
      Number(annonce.latitude),
      Number(annonce.longitude),
    ]}
    zoom={15}
    style={{
      height: "420px",
      width: "100%",
    }}
    scrollWheelZoom={false}
  >
    <TileLayer
      attribution="© OpenStreetMap"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <Marker
      position={[
        Number(annonce.latitude),
        Number(annonce.longitude),
      ]}
    />

  </MapContainer>

</div>

  ) : (

    <div className="mt-8 rounded-2xl bg-[#F8FAF9] border border-[#ECE7DD] p-10 text-center">

      <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF8F3] flex items-center justify-center">

        <Map
          size={30}
          className="text-[#047857]"
        />

      </div>

      <h3 className="mt-5 text-xl font-semibold text-[#1C2520]">
        Localisation indisponible
      </h3>

      <p className="mt-3 text-[#6B7280] max-w-md mx-auto">
        Le propriétaire n'a pas encore renseigné les coordonnées GPS de ce bien.
      </p>

    </div>

  )}

</section>

    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#ECE7DD] p-5 hover:shadow-md transition">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-xl bg-[#F3FBF7] flex items-center justify-center">

          <Icon
            size={22}
            className="text-[#047857]"
          />

        </div>

        <div>

          <div className="text-sm text-[#6B7280]">
            {label}
          </div>

          <div className="mt-1 font-semibold capitalize text-[#1C2520]">
            {value}
          </div>

        </div>

      </div>

    </div>
  );
}