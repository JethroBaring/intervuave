"use client";
import React, { useRef, useEffect, useState } from "react";
import Card from "../common/Card";

export default function KanbanScrollWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const percent = scrollLeft / (scrollWidth - clientWidth);
      setScrollPercent(percent || 0);
      setThumbWidth((clientWidth / scrollWidth) * 200); // minimap width
    };

    el.addEventListener("scroll", updateScroll);
    updateScroll();

    return () => el.removeEventListener("scroll", updateScroll);
  }, []);

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const minimap = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const el = scrollRef.current;
    if (!el) return;

    const ratio = clickX / minimap.offsetWidth;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) * ratio;
  };

  return (
    <div className="relative w-full h-full">
      {/* Scrollable Kanban Area */}
      <div
        ref={scrollRef}
        className="hide-scrollbar overflow-x-auto flex space-x-6 h-full no-scrollbar"
      >
        {children}
      </div>

      {/* Minimap (does NOT take space) */}
      <Card
        // onClick={handleMinimapClick}
        className="absolute bottom-4 right-6 w-[200px] h-[10px] cursor-pointer z-10"
      >
        <div
          className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-full transition-all"
          style={{
            width: `${thumbWidth}px`,
            transform: `translateX(${(200 - thumbWidth) * scrollPercent}px)`,
          }}
        />
      </Card>
    </div>
  );
}
