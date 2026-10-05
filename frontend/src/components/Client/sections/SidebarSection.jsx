import {
  Phone,
  Mail,
  Heart,
  CalendarDays,
  Eye,
} from "lucide-react";

import { formatDate } from "../../../utils/formatters";

export default function SidebarSection({
  annonce,
  onFavorite,
  onContact,
  onVisit,
}) {
  const publishedDate = annonce.published_at || annonce.created_at;

  return (
    <aside className="sticky top-24 h-fit">

      <div className="overflow-hidden rounded-xl bg-white border border-[#ECE7DD] shadow-sm">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-[#047857] to-[#0F766E] p-5 text-white">

          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-[#047857] text-lg font-bold shadow-sm">

              {annonce.owner_name?.charAt(0).toUpperCase()}

            </div>

            <div>

              <h3 className="text-base font-semibold">

                {annonce.owner_name}

              </h3>

            </div>

          </div>

        </div>

        {/* CONTACT */}

        <div className="p-5">

          {annonce.status === "published" && (
          <div className="space-y-2.5 text-sm">

            <div className="flex items-center gap-3">

              <Phone
                size={16}
                className="text-[#047857]"
              />

              <span>{annonce.owner_phone}</span>

            </div>

            <div className="flex items-center gap-3">

              <Mail
                size={16}
                className="text-[#047857]"
              />

              <span className="truncate">

                {annonce.owner_email}

              </span>

            </div>

          </div>
          )}

          {/* BUTTONS */}

          {annonce.status === "published" && (
          <>
          <button
            onClick={onContact}
            className="
              mt-5
              w-full
              rounded-lg
              bg-[#047857]
              py-2 text-sm
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
              mt-2.5
              w-full
              rounded-lg
              border
              border-[#047857]
              py-2 text-sm
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
              mt-2.5
              w-full
              rounded-lg
              border
              border-[#ECE7DD]
              py-2 text-sm
              hover:bg-[#FAF8F3]
              transition
            "
          >
            <div className="flex items-center justify-center gap-2">

              <Heart size={16} />

              Ajouter aux favoris

            </div>

          </button>
          </>
          )}

          {/* INFOS */}

          <div
            className={`space-y-3 text-sm ${
              annonce.status === "published" ? "mt-5 border-t border-[#ECE7DD] pt-5" : ""
            }`}
          >

            {publishedDate && (
              <div className="flex justify-between">

                <span className="text-[#6B7280]">
                  Publié
                </span>

                <strong>
                  {formatDate(publishedDate)}
                </strong>

              </div>
            )}

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

                <Eye size={14} />

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