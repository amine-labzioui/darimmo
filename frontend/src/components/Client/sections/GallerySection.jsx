import {
  Heart,
  Share2,
  Camera,
} from "lucide-react";

import { getMainImageUrl } from "../../../utils/helpers";

export default function GallerySection({
  annonce,
  activeImage,
  setActiveImage,
}) {
  const images =
    annonce.images?.length
      ? annonce.images.map((img) => img.image)
      : [getMainImageUrl(annonce)];

  const isSale =
    annonce.transaction_type === "vente";

  return (
    <section className="max-w-7xl mx-auto px-6 pt-10">

      <div className="grid lg:grid-cols-[1fr_220px] gap-5">

        {/* IMAGE PRINCIPALE */}

        <div className="relative overflow-hidden rounded-[36px] shadow-2xl h-[650px] bg-[#ECE7DD] group">

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

          <div className="absolute top-7 left-7 flex gap-3">

            <span
              className={`px-5 py-2 rounded-full text-sm font-semibold shadow-lg ${
                isSale
                  ? "bg-[#047857] text-white"
                  : "bg-[#C2622D] text-white"
              }`}
            >
              {isSale ? "À vendre" : "À louer"}
            </span>

            <span className="px-5 py-2 rounded-full bg-white/90 backdrop-blur text-sm font-semibold text-[#1C2520]">
              Premium
            </span>

          </div>

          {/* ACTIONS */}

          <div className="absolute top-7 right-7 flex gap-3">

            <button
              className="
                w-12
                h-12
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
              <Heart size={20} />
            </button>

            <button
              className="
                w-12
                h-12
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
              <Share2 size={20} />
            </button>

          </div>

          {/* PHOTOS */}

          <div className="absolute bottom-7 right-7">

            <div className="flex items-center gap-2 rounded-full bg-black/55 backdrop-blur px-4 py-2 text-white">

              <Camera size={18} />

              <span className="font-medium">

                {images.length} Photos

              </span>

            </div>

          </div>

        </div>

        {/* MINIATURES */}

        <div className="flex lg:flex-col gap-4 overflow-auto">

          {images.map((image, index) => (

            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`
                relative
                overflow-hidden
                rounded-[24px]
                transition-all
                duration-300
                ${
                  activeImage === index
                    ? "ring-4 ring-[#047857] scale-[1.03]"
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