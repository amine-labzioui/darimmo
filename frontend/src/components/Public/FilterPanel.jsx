import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { CITIES, PROPERTY_TYPES, TRANSACTION_TYPES } from "../../utils/constants";

export default function FilterPanel({ filters, onChange, onReset, resultsCount }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E6DFD0] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#1C2520]">
          <SlidersHorizontal size={17} />
          <span className="font-medium text-[15px]">Filtres</span>
        </div>
        {(filters.city || filters.property_type || filters.price_min || filters.price_max) && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[13px] text-[#C2622D] hover:underline"
          >
            <X size={13} /> Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Field label="Type de transaction">
          <div className="flex gap-2">
            {TRANSACTION_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => update("transaction_type", filters.transaction_type === t.value ? "" : t.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-[13.5px] font-medium border transition-colors ${
                  filters.transaction_type === t.value
                    ? "bg-[#047857] border-[#047857] text-white"
                    : "border-[#E6DFD0] text-[#3F4A43] hover:border-[#047857]/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Ville">
          <SelectInput
            value={filters.city}
            onChange={(v) => update("city", v)}
            options={CITIES}
            placeholder="Toutes les villes"
          />
        </Field>

        <Field label="Type de bien">
          <SelectInput
            value={filters.property_type}
            onChange={(v) => update("property_type", v)}
            options={PROPERTY_TYPES.map((p) => p.value)}
            labels={Object.fromEntries(PROPERTY_TYPES.map((p) => [p.value, p.label]))}
            placeholder="Tous les types"
          />
        </Field>

        <Field label="Budget (MAD)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.price_min || ""}
              onChange={(e) => update("price_min", e.target.value)}
              className="w-1/2 px-3 py-2 rounded-lg border border-[#E6DFD0] text-[13.5px] outline-none focus:border-[#047857]"
            />
            <span className="text-[#8C9189]">—</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.price_max || ""}
              onChange={(e) => update("price_max", e.target.value)}
              className="w-1/2 px-3 py-2 rounded-lg border border-[#E6DFD0] text-[13.5px] outline-none focus:border-[#047857]"
            />
          </div>
        </Field>

        <Field label="Chambres min.">
          <SelectInput
            value={filters.bedrooms_min}
            onChange={(v) => update("bedrooms_min", v)}
            options={["1", "2", "3", "4", "5"]}
            placeholder="Indifférent"
          />
        </Field>

        <div className="space-y-2 pt-1">
          <Checkbox
            label="Piscine"
            checked={filters.has_pool === "true"}
            onChange={(v) => update("has_pool", v ? "true" : "")}
          />
          <Checkbox
            label="Parking"
            checked={filters.has_parking === "true"}
            onChange={(v) => update("has_parking", v ? "true" : "")}
          />
          <Checkbox
            label="Meublé"
            checked={filters.is_furnished === "true"}
            onChange={(v) => update("is_furnished", v ? "true" : "")}
          />
        </div>
      </div>

      {typeof resultsCount === "number" && (
        <p className="mt-5 pt-4 border-t border-[#EFEAE0] text-[13px] text-[#5C6961]">
          <span className="font-medium text-[#1C2520]">{resultsCount}</span> bien(s) trouvé(s)
        </p>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium text-[#5C6961] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SelectInput({ value, onChange, options, labels, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-[#E6DFD0] text-[13.5px] text-[#1C2520] outline-none focus:border-[#047857] bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labels?.[opt] || opt}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9189] pointer-events-none" />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-[#E6DFD0] text-[#047857] focus:ring-[#047857]"
      />
      <span className="text-[13.5px] text-[#3F4A43]">{label}</span>
    </label>
  );
}
