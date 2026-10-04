import {
  Heart,
  Camera,
} from "lucide-react";

import { getMainImageUrl, isBoostActive } from "../../../utils/helpers";

export default function GallerySection({
  annonce,
  activeImage,
  setActiveImage,
  onFavorite,
}) {
  const images =
    annonce.images?.length
      ? annonce.images.map((img) => img.image)
      : [getMainImageUrl(annonce)];

  const isSale =
    annonce.transaction_type === "vente";

  return (
    <section className="max-w-7xl mx-auto px-6 pt-6">

      <div className="grid lg:grid-cols-[1fr_220px] gap-4">

        {/* IMAGE PRINCIPALE */}

        <div className="relative overflow-hidden rounded-xl shadow-sm h-[260px] md:h-[380px] lg:h-[460px] bg-[#ECE7DD] group">

          <img
            src={images[activeImage]}
            alt={annonce.title}
            className="
              w-full
              h-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-105
            "
          />

          {/* Overlay */}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* BADGES */}

          <div className="absolute top-4 left-4 flex gap-2">

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                isSale
                  ? "bg-[#047857] text-white"
                  : "bg-[#C2622D] text-white"
              }`}
            >
              {isSale ? "À vendre" : "À louer"}
            </span>

            {isBoostActive(annonce) && (
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-[#1C2520]">
                Premium
              </span>
            )}

          </div>

          {/* ACTIONS */}

          <div className="absolute top-4 right-4 flex gap-2">

            <button
              onClick={onFavorite}
              aria-label="Ajouter aux favoris"
              className="
                w-9
                h-9
                rounded-full
                bg-white/80
                backdrop-blur
                flex
                items-center
                justify-center
                hover:bg-white
                transition
              "
            >
              <Heart size={16} />
            </button>

          </div>

          {/* PHOTOS */}

          <div className="absolute bottom-4 right-4">

            <div className="flex items-center gap-2 rounded-full bg-black/55 backdrop-blur px-3 py-1 text-xs text-white">

              <Camera size={14} />

              <span className="font-medium">

                {images.length} Photos

              </span>

            </div>

          </div>

        </div>

        {/* MINIATURES */}

        <div className="flex lg:flex-col gap-3 overflow-auto">

          {images.map((image, index) => (

            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`
                relative
                overflow-hidden
                rounded-lg
                transition-all
                duration-300
                ${
                  activeImage === index
                    ? "ring-2 ring-[#047857] scale-[1.03]"
                    : "opacity-80 hover:opacity-100"
                }
              `}
            >

              <img
                src={image}
                alt=""
                className="
                  w-[200px]
                  lg:w-full
                  h-[145px]
                  object-cover
                  hover:scale-110
                  transition
                  duration-500
                "
              />

            </button>

          ))}

        </div>

      </div>

    </section>
  );
}