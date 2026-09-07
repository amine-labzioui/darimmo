import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Maximize, ChevronDown } from "lucide-react";
import { CITIES, PROPERTY_TYPES, PRICE_RANGES } from "../../utils/constants";

function SelectField({ icon: Icon, placeholder, options, value, onChange, labels }) {
  return (
    <div className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2.5 px-4 h-12 rounded-xl border border-[#E6DFD0] bg-[#FFFBF5] hover:border-[#047857]/40 transition-colors duration-200">
        <Icon size={18} className="text-[#047857] shrink-0" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[14.5px] text-[#1C2520] outline-none appearance-none cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {labels?.[opt] || opt}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="text-[#8C9189] shrink-0" />
      </div>
    </div>
  );
}

export default function HeroSearch() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("vente");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    params.set("transaction_type", tab);
    if (city) params.set("city", city);
    if (propertyType) params.set("property_type", propertyType);
    const range = PRICE_RANGES.find((r) => r.label === priceRange);
    if (range) {
      if (range.min) params.set("price_min", range.min);
      if (range.max) params.set("price_max", range.max);
    }
    navigate(`/recherche?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(28,37,32,0.18)] border border-[#E6DFD0] p-2.5 sm:p-3">
      <div className="flex gap-1 mb-3">
        {[
          { key: "vente", label: "Acheter" },
          { key: "location", label: "Louer" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-[14.5px] font-medium transition-colors duration-200 ${
              tab === t.key ? "bg-[#047857] text-white" : "text-[#5C6961] hover:bg-[#F5F0E8]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <SelectField icon={MapPin} placeholder="Ville" options={CITIES} value={city} onChange={setCity} />
        <SelectField
          icon={Maximize}
          placeholder="Type de bien"
          options={PROPERTY_TYPES.map((p) => p.value)}
          labels={Object.fromEntries(PROPERTY_TYPES.map((p) => [p.value, p.label]))}
          value={propertyType}
          onChange={setPropertyType}
        />
        <SelectField
          icon={Search}
          placeholder="Budget"
          options={PRICE_RANGES.map((r) => r.label)}
          value={priceRange}
          onChange={setPriceRange}
        />
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 px-7 h-12 rounded-xl bg-[#C2622D] text-white text-[14.5px] font-medium hover:bg-[#a8521f] transition-colors duration-200 shrink-0 shadow-sm"
        >
          <Search size={17} />
          Rechercher
        </button>
      </div>
    </div>
  );
}
