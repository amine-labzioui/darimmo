import {
  Phone,
  Mail,
  Heart,
  CalendarDays,
  Eye,
  BadgeCheck,
} from "lucide-react";

export default function SidebarSection({
  annonce,
  onFavorite,
  onContact,
  onVisit,
}) {
  return (
    <aside className="sticky top-24 h-fit">

      <div className="overflow-hidden rounded-[34px] bg-white border border-[#ECE7DD] shadow-2xl">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-[#047857] to-[#0F766E] p-8 text-white">

          <div className="flex items-center gap-4">

            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-[#047857] text-2xl font-bold shadow-lg">

              {annonce.owner_name?.charAt(0).toUpperCase()}

            </div>

            <div>

              <h3 className="text-xl font-bold">

                {annonce.owner_name}

              </h3>

              <div className="mt-2 flex items-center gap-2 text-sm">

                <BadgeCheck size={16} />

                <span>Agent vérifié</span>

              </div>

            </div>

          </div>

        </div>

        {/* CONTACT */}

        <div className="p-8">

          <div className="space-y-5">

            <div className="flex items-center gap-3">

              <Phone
                size={18}
                className="text-[#047857]"
              />

              <span>{annonce.owner_phone}</span>

            </div>

            <div className="flex items-center gap-3">

              <Mail
                size={18}
                className="text-[#047857]"
              />

              <span className="truncate">

                {annonce.owner_email}

              </span>

            </div>

          </div>

          {/* BUTTONS */}

          <button
            onClick={onContact}
            className="
              mt-8
              w-full
              rounded-2xl
              bg-[#047857]
              py-4
              text-white
              font-semibold
              hover:bg-[#03644d]
              transition
            "
          >
            Contacter le vendeur
          </button>

          <button
            onClick={onVisit}
            className="
              mt-4
              w-full
              rounded-2xl
              border
              border-[#047857]
              py-4
              font-semibold
              text-[#047857]
              hover:bg-[#F4FBF8]
              transition
            "
          >
            Programmer une visite
          </button>

          <button
            onClick={onFavorite}
            className="
              mt-4
              w-full
              rounded-2xl
              border
              border-[#ECE7DD]
              py-4
              hover:bg-[#FAF8F3]
              transition
            "
          >
            <div className="flex items-center justify-center gap-3">

              <Heart size={18} />

              Ajouter aux favoris

            </div>

          </button>

          {/* INFOS */}

          <div className="mt-10 border-t border-[#ECE7DD] pt-8 space-y-6">

            <div className="flex justify-between">

              <span className="text-[#6B7280]">
                Publié
              </span>

              <strong>
                27 Juin 2026
              </strong>

            </div>

            <div className="flex justify-between">

              <span className="text-[#6B7280]">
                Référence
              </span>

              <strong>

                #{annonce.id}

              </strong>

            </div>

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-2 text-[#6B7280]">

                <Eye size={17} />

                Vues

              </div>

              <strong>

                {annonce.views_count}

              </strong>

            </div>

            <div className="flex justify-between">

              <span className="text-[#6B7280]">
                Type
              </span>

              <strong className="capitalize">

                {annonce.property_type}

              </strong>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}