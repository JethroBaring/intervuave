"use client";

import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import invariant from "tiny-invariant";

import { isSafari } from "@/components/ui/shared/is-safari";
import {
  type Edge,
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  getCardData,
  getCardDropTargetData,
  isCardData,
  isDraggingACard,
  TCard,
} from "./data";
import { isShallowEqual } from "./is-shallow-equal";
import { BadgeCheck, Clock, InfoIcon, TimerOff, Upload } from "lucide-react";
import moment from "moment";
import { useInterviewStore } from "@/stores/useInterviewStore";

type TCardState =
  | {
      type: "idle";
    }
  | {
      type: "is-dragging";
    }
  | {
      type: "is-dragging-and-left-self";
    }
  | {
      type: "is-over";
      dragging: DOMRect;
      closestEdge: Edge;
    }
  | {
      type: "preview";
      container: HTMLElement;
      dragging: DOMRect;
    };

const idle: TCardState = { type: "idle" };

const innerStyles: { [Key in TCardState["type"]]?: string } = {
  idle: "cursor-grab",
  "is-dragging": "opacity-40",
};

const outerStyles: { [Key in TCardState["type"]]?: string } = {
  // We no longer render the draggable item after we have left it
  // as it's space will be taken up by a shadow on adjacent items.
  // Using `display:none` rather than returning `null` so we can always
  // return refs from this component.
  // Keeping the refs allows us to continue to receive events during the drag.
  "is-dragging-and-left-self": "hidden",
};

export function CardShadow({ dragging }: { dragging: DOMRect }) {
  return (
    <div
      className="flex-shrink-0 rounded-lg bg-gray-900"
      style={{ height: dragging.height }}
    />
  );
}

export function getCardStyle(card: TCard) {
  if (card.interview.status === "DRAFT") {
    return (
      <>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{`${card.candidate.firstName} ${card.candidate.lastName}`}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {card.interview.position}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created:{" "}
            {moment(card.interview.createdAt).format("MMMM D, YYYY - h:mm A")}
          </p>
        </div>
      </>
    );
  } else if (card.interview.status === "PENDING") {
    return (
      <>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{`${card.candidate.firstName} ${card.candidate.lastName}`}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {card.interview.position}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <InfoIcon className="h-4 w-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sent:{" "}
            {moment(card.interview.emailSentAt).format("MMMM D, YYYY - h:mm A")}
          </p>
        </div>
      </>
    );
  } else if (card.interview.status === "IN_PROGRESS") {
    return (
      <>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{`${card.candidate.firstName} ${card.candidate.lastName}`}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {card.interview.position}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Started:{" "}
            {moment(card.interview.interviewStartedAt).format("MMMM D, YYYY - h:mm A")}
          </p>
        </div>
      </>
    );
  } else if (card.interview.status === "SUBMITTED") {
    return (
      <>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{`${card.candidate.firstName} ${card.candidate.lastName}`}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {card.interview.position}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Upload className="h-4 w-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Submitted:{" "}
            {moment(card.interview.submittedAt).format("MMMM D, YYYY - h:mm A")}
          </p>
        </div>
      </>
    );
  } else if (card.interview.status === "PROCESSING" || card.interview.status === "EVALUATING") {
    return (
      <>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{`${card.candidate.firstName} ${card.candidate.lastName}`}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {card.interview.position}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <InfoIcon className="h-4 w-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sent:{" "}
            {moment(card.interview.processedAt).format("MMMM D, YYYY - h:mm A")}
          </p>
        </div>
      </>
    );
  } else if (card.interview.status === "EVALUATED") {
    return (
      <>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{`${card.candidate.firstName} ${card.candidate.lastName}`}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {card.interview.position}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <BadgeCheck className="h-4 w-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Evaluated:{" "}
            {moment(card.interview.evaluatedAt).format("MMMM D, YYYY - h:mm A")}
          </p>
        </div>
      </>
    );
  } else if (card.interview.status === "EXPIRED") {
    return (
      <>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{`${card.candidate.firstName} ${card.candidate.lastName}`}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {card.interview.position}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <TimerOff className="h-4 w-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Expired:{" "}
            {moment(card.interview.updatedAt).format("MMMM D, YYYY - h:mm A")}
          </p>
        </div>
      </>
    );
  }

  return <></>;
}

export function CardDisplay({
  card,
  state,
  outerRef,
  innerRef,
}: {
  card: TCard;
  state: TCardState;
  outerRef?: React.MutableRefObject<HTMLDivElement | null>;
  innerRef?: MutableRefObject<HTMLDivElement | null>;
}) {

  const openCardModal  = useInterviewStore((state) => state.openCardModal)

  return (
    <div
      ref={outerRef}
      className={`flex flex-shrink-0 flex-col gap-3 px-3 py-2 ${
        outerStyles[state.type]
      }`}
      onClick={(e) => openCardModal(card)}
    >
      {/* Put a shadow before the item if closer to the top edge */}
      {state.type === "is-over" && state.closestEdge === "top" ? (
        <CardShadow dragging={state.dragging} />
      ) : null}
      <div
        className={`rounded-lg border border-gray-200  dark:border-gray-800 dark:bg-white/[0.03] flex flex-col gap-3 p-4 text-slate-300 ${
          innerStyles[state.type]
        } ${card.interview.status !== 'DRAFT' ? 'cursor-pointer' : ''}`}
        ref={innerRef}
        style={
          state.type === "preview"
            ? {
                width: state.dragging.width,
                height: state.dragging.height,
                transform: !isSafari() ? "rotate(4deg)" : undefined,
              }
            : undefined
        }
      >
        {getCardStyle(card)}
      </div>
      {/* Put a shadow after the item if closer to the bottom edge */}
      {state.type === "is-over" && state.closestEdge === "bottom" ? (
        <CardShadow dragging={state.dragging} />
      ) : null}
    </div>
  );
}

export function BoardCard({
  card,
  columnId,
}: {
  card: TCard;
  columnId: string;
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    invariant(outer && inner);

    return combine(
      // only draft-status cards can be dragged
      ...(card.interview.status === "DRAFT"
        ? [
            draggable({
              element: inner,
              getInitialData: ({ element }) =>
                getCardData({
                  card,
                  columnId,
                  rect: element.getBoundingClientRect(),
                }),
              onGenerateDragPreview({ nativeSetDragImage, location, source }) {
                const data = source.data;
                invariant(isCardData(data));
                setCustomNativeDragPreview({
                  nativeSetDragImage,
                  getOffset: preserveOffsetOnSource({
                    element: inner,
                    input: location.current.input,
                  }),
                  render({ container }) {
                    setState({
                      type: "preview",
                      container,
                      dragging: inner.getBoundingClientRect(),
                    });
                  },
                });
              },
              onDragStart() {
                setState({ type: "is-dragging" });
              },
              onDrop() {
                setState(idle);
              },
            }),
          ]
        : []),
      // cards always remain drop-targets for reordering
      dropTargetForElements({
        element: outer,
        getIsSticky: () => true,
        canDrop: isDraggingACard,
        getData: ({ element, input }) => {
          const data = getCardDropTargetData({ card, columnId });
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          });
        },
        onDragEnter({ source, self }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.interview.id === card.interview.id) {
            return;
          }
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) {
            return;
          }

          setState({
            type: "is-over",
            dragging: source.data.rect,
            closestEdge,
          });
        },
        onDrag({ source, self }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.interview.id === card.interview.id) {
            return;
          }
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) {
            return;
          }
          // optimization - Don't update react state if we don't need to.
          const proposed: TCardState = {
            type: "is-over",
            dragging: source.data.rect,
            closestEdge,
          };
          setState((current) => {
            if (isShallowEqual(proposed, current)) {
              return current;
            }
            return proposed;
          });
        },
        onDragLeave({ source }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.interview.id === card.interview.id) {
            setState({ type: "is-dragging-and-left-self" });
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      })
    );
  }, [card, columnId]);

  return (
    <>
      <CardDisplay
        outerRef={outerRef}
        innerRef={innerRef}
        state={state}
        card={card}
      />
      {state.type === "preview"
        ? createPortal(
            <CardDisplay state={state} card={card} />,
            state.container
          )
        : null}
    </>
  );
}
