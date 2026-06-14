"use client";

import { useRef } from "react";

type Thumbnail = {
  id: string;
  image_url: string;
};

export default function AdminListingThumbnailStrip({
  images,
  title,
}: {
  images: Thumbnail[];
  title: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollOne = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollBy({
      left: (viewport.clientWidth / 5) * direction,
      behavior: "smooth",
    });
  };

  if (images.length === 0) {
    return (
      <div className="flex h-16 w-full items-center justify-center rounded-xl bg-[var(--accent-soft)] text-xs text-neutral-500 sm:w-80">
        No images
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-80">
      {images.length > 5 ? (
        <button
          type="button"
          onClick={() => scrollOne(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-lg text-[var(--accent)]"
          aria-label={`Show previous ${title} thumbnail`}
        >
          &lsaquo;
        </button>
      ) : null}
      <div
        ref={viewportRef}
        className="grid flex-1 auto-cols-[calc((100%_-_1rem)/5)] grid-flow-col gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${title} thumbnails`}
      >
        {images.map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.id}
            src={image.image_url}
            alt={`${title} thumbnail ${index + 1}`}
            className="h-16 w-full rounded-lg border border-[var(--line)] object-cover"
          />
        ))}
      </div>
      {images.length > 5 ? (
        <button
          type="button"
          onClick={() => scrollOne(1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-lg text-[var(--accent)]"
          aria-label={`Show next ${title} thumbnail`}
        >
          &rsaquo;
        </button>
      ) : null}
    </div>
  );
}
