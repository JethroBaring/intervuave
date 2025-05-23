"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { useContext, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { Column } from "./column";
import {
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  TBoard,
  TColumn,
} from "./data";
import { SettingsContext } from "./settings-context";
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { bindAll } from "bind-event-listener";
import { blockBoardPanningAttr } from "./data-attributes";
import { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import KanbanScrollWrapper from "./kanbanscrollwrapper";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { API_URL } from "@/lib/constants";
import InterviewModal from "./InterviewModal";
import { useToastStore } from "@/stores/useToastStore";
const systemLockedStatuses = [
  "in_progress",
  "processing",
  "submitted",
  "evaluated",
  "expired",
];

export function Board({ initial }: { initial: TBoard }) {
  const [data, setData] = useState(initial);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    const element = scrollableRef.current;
    invariant(element);
    return combine(
      monitorForElements({
        canMonitor: isDraggingACard,
        onDrop({ source, location }) {
          const dragging = source.data;
          if (!isCardData(dragging)) {
            return;
          }

          const innerMost = location.current.dropTargets[0];

          if (!innerMost) {
            return;
          }
          const dropTargetData = innerMost.data;
          const homeColumnIndex = data.columns.findIndex(
            (column) => column.id === dragging.columnId
          );
          const home: TColumn | undefined = data.columns[homeColumnIndex];

          if (!home) {
            return;
          }
          const cardIndexInHome = home.cards.findIndex(
            (card) => card.interview.id === dragging.card.interview.id
          );

          // dropping on a card
          if (isCardDropTargetData(dropTargetData)) {
            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.columnId
            );
            const destination = data.columns[destinationColumnIndex];
            // reordering in home column
            if (home === destination) {
              const cardFinishIndex = home.cards.findIndex(
                (card) => card.interview.id === dropTargetData.card.interview.id
              );

              // could not find cards needed
              if (cardIndexInHome === -1 || cardFinishIndex === -1) {
                return;
              }

              // no change needed
              if (cardIndexInHome === cardFinishIndex) {
                return;
              }

              const closestEdge = extractClosestEdge(dropTargetData);

              const reordered = reorderWithEdge({
                axis: "vertical",
                list: home.cards,
                startIndex: cardIndexInHome,
                indexOfTarget: cardFinishIndex,
                closestEdgeOfTarget: closestEdge,
              });

              const updated: TColumn = {
                ...home,
                cards: reordered,
              };
              const columns = Array.from(data.columns);
              columns[homeColumnIndex] = updated;
              setData({ ...data, columns });
              return;
            }

            // moving card from one column to another

            // unable to find destination
            if (!destination) {
              return;
            }

            if (home.id === "draft" && destination.id !== "pending") {
              console.log("SHOW TOAST!!!")
              return;
            }

            // disallow moving from pending back into draft
            if (home.id === "pending" && destination.id === "draft") {
              console.log("SHOW TOAST!!!")
              return;
            }

            if (
              (home.id !== "draft" && destination.id !== "draft") ||
              systemLockedStatuses.includes(home.id) ||
              systemLockedStatuses.includes(destination.id)
            ) {
              console.log("SHOW TOAST!!!")
              return;
            }

            const indexOfTarget = destination.cards.findIndex(
              (card) => card.interview.id === dropTargetData.card.interview.id
            );

            const closestEdge = extractClosestEdge(dropTargetData);
            const finalIndex =
              closestEdge === "bottom" ? indexOfTarget + 1 : indexOfTarget;

            // remove card from home list
            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            // insert into destination list
            const destinationCards = Array.from(destination.cards);
            destinationCards.splice(finalIndex, 0, dragging.card);

            const columns = Array.from(data.columns);
            columns[homeColumnIndex] = {
              ...home,
              cards: homeCards,
            };
            columns[destinationColumnIndex] = {
              ...destination,
              cards: destinationCards,
            };
            setData({ ...data, columns });

            const newStatus = destination.id.toUpperCase().replace("_", " ");
            updateInterviewStatus(dragging.card.interview.id, newStatus);
            return;
          }

          // dropping onto a column, but not onto a card
          if (isColumnData(dropTargetData)) {
            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.column.id
            );
            const destination = data.columns[destinationColumnIndex];

            if (!destination) {
              return;
            }
            
            if (home.id === "draft" && destination.id !== "pending") {
              console.log("SHOW TOAST!!!")
              return;
            }

            // disallow moving from pending back into draft
            if (home.id === "pending" && destination.id === "draft") {
              console.log("SHOW TOAST!!!")
              return;
            }

            if (
              (home.id !== "draft" && destination.id !== "draft") ||
              systemLockedStatuses.includes(home.id) ||
              systemLockedStatuses.includes(destination.id)
            ) {
              console.log("SHOW TOAST!!!")
              return;
            }

            // dropping on home
            if (home === destination) {
              console.log("moving card to home column");

              // move to last position
              const reordered = reorder({
                list: home.cards,
                startIndex: cardIndexInHome,
                finishIndex: home.cards.length - 1,
              });

              const updated: TColumn = {
                ...home,
                cards: reordered,
              };
              const columns = Array.from(data.columns);
              columns[homeColumnIndex] = updated;
              setData({ ...data, columns });
              return;
            }

            console.log("moving card to another column");

            // remove card from home list

            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            // insert into destination list
            const destinationCards = Array.from(destination.cards);
            destinationCards.splice(destination.cards.length, 0, dragging.card);

            const columns = Array.from(data.columns);
            columns[homeColumnIndex] = {
              ...home,
              cards: homeCards,
            };
            columns[destinationColumnIndex] = {
              ...destination,
              cards: destinationCards,
            };
            setData({ ...data, columns });
            // ✅ Call API
            const newStatus = destination.id.toUpperCase().replace("_", " ");
            updateInterviewStatus(dragging.card.interview.id, newStatus);
            return;
          }
        },
      }),
      monitorForElements({
        canMonitor: isDraggingAColumn,
        onDrop({ source, location }) {
          const dragging = source.data;
          if (!isColumnData(dragging)) {
            return;
          }

          const innerMost = location.current.dropTargets[0];

          if (!innerMost) {
            return;
          }
          const dropTargetData = innerMost.data;

          if (!isColumnData(dropTargetData)) {
            return;
          }

          const homeIndex = data.columns.findIndex(
            (column) => column.id === dragging.column.id
          );
          const destinationIndex = data.columns.findIndex(
            (column) => column.id === dropTargetData.column.id
          );

          if (homeIndex === -1 || destinationIndex === -1) {
            return;
          }

          if (homeIndex === destinationIndex) {
            return;
          }

          const reordered = reorder({
            list: data.columns,
            startIndex: homeIndex,
            finishIndex: destinationIndex,
          });
          setData({ ...data, columns: reordered });
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getConfiguration: () => ({ maxScrollSpeed: settings.boardScrollSpeed }),
        element,
      }),
      unsafeOverflowAutoScrollForElements({
        element,
        getConfiguration: () => ({ maxScrollSpeed: settings.boardScrollSpeed }),
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          if (!settings.isOverflowScrollingEnabled) {
            return false;
          }

          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getOverflow() {
          return {
            forLeftEdge: {
              top: 1000,
              left: 1000,
              bottom: 1000,
            },
            forRightEdge: {
              top: 1000,
              right: 1000,
              bottom: 1000,
            },
          };
        },
      })
    );
  }, [data, settings]);

  // Panning the board
  useEffect(() => {
    let cleanupActive: CleanupFn | null = null;
    const scrollable = scrollableRef.current;
    invariant(scrollable);

    function begin({ startX }: { startX: number }) {
      let lastX = startX;

      const cleanupEvents = bindAll(
        window,
        [
          {
            type: "pointermove",
            listener(event) {
              const currentX = event.clientX;
              const diffX = lastX - currentX;

              lastX = currentX;
              scrollable?.scrollBy({ left: diffX });
            },
          },
          // stop panning if we see any of these events
          ...(
            [
              "pointercancel",
              "pointerup",
              "pointerdown",
              "keydown",
              "resize",
              "click",
              "visibilitychange",
            ] as const
          ).map((eventName) => ({
            type: eventName,
            listener: () => cleanupEvents(),
          })),
        ],
        // need to make sure we are not after the "pointerdown" on the scrollable
        // Also this is helpful to make sure we always hear about events from this point
        { capture: true }
      );

      cleanupActive = cleanupEvents;
    }

    const cleanupStart = bindAll(scrollable, [
      {
        type: "pointerdown",
        listener(event) {
          if (!(event.target instanceof HTMLElement)) {
            return;
          }
          // ignore interactive elements
          if (event.target.closest(`[${blockBoardPanningAttr}]`)) {
            return;
          }

          begin({ startX: event.clientX });
        },
      },
    ]);

    return function cleanupAll() {
      cleanupStart();
      cleanupActive?.();
    };
  }, []);
  const companyId = useCompanyStore((state) => state.companyId)

  async function updateInterviewStatus(interviewId: string, status: string) {
    try {
      const res = await fetch(
        `${API_URL}/companies/${companyId}/interviews/${interviewId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: status.replace(" ", "_") }),
          credentials: "include"
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update interview status");
      }
      useToastStore.getState().showToast({
        title: "Success",
        message: "Interview link has been sent",
        type: "success"
      })
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      className={`flex-auto flex h-0 flex-row gap-6 overflow-x-auto no-scrollbar`}
      // className={`flex-auto flex h-0 flex-row gap-6 overflow-x-auto [scrollbar-color:theme(colors.sky.600)_theme(colors.sky.800)] [scrollbar-width:thin]`}
      ref={scrollableRef}
    >
      <KanbanScrollWrapper>
        {data.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </KanbanScrollWrapper>
      <InterviewModal />
    </div>
  );
}
