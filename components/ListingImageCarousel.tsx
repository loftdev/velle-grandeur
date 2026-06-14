"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type CarouselImage = {
  id: string;
  image_url: string;
};

export default function ListingImageCarousel({
  images,
  listingHref,
  title,
}: {
  images: CarouselImage[];
  listingHref: string;
  title: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToImage = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      left: viewport.clientWidth * index,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;

    setActiveIndex(
      Math.min(
        images.length - 1,
        Math.max(0, Math.round(viewport.scrollLeft / viewport.clientWidth)),
      ),
    );
  };

  if (images.length === 0) {
    return (
      <Link
        href={listingHref}
        className="flex h-48 items-center justify-center bg-[var(--accent-soft)] text-sm text-neutral-500"
      >
        No image available
      </Link>
    );
  }

  return (
    <div className="relative h-48 bg-[var(--accent-soft)]">
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${title} image gallery`}
      >
        {images.map((image, index) => (
          <Link
            key={image.id}
            href={listingHref}
            className="h-full w-full shrink-0 snap-center"
            aria-label={`View ${title}, image ${index + 1} of ${images.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.image_url}
              alt={`${title} - image ${index + 1}`}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </Link>
        ))}
      </div>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() =>
              scrollToImage(
                activeIndex === 0 ? images.length - 1 : activeIndex - 1,
              )
            }
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg text-white shadow-sm backdrop-blur"
            aria-label="Previous image"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={() =>
              scrollToImage(
                activeIndex === images.length - 1 ? 0 : activeIndex + 1,
              )
            }
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg text-white shadow-sm backdrop-blur"
            aria-label="Next image"
          >
            &rsaquo;
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/45 px-2 py-1.5 backdrop-blur">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => scrollToImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/65"
                }`}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
