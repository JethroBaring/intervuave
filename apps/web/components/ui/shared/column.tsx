"use client";

import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { ChevronDown, Copy, Ellipsis, Plus } from "lucide-react";
import { memo, useContext, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { BoardCard, CardShadow } from "./card";
import {
  getColumnData,
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  TCardData,
  TColumn,
} from "./data";
import { blockBoardPanningAttr } from "./data-attributes";
import { isSafari } from "./is-safari";
import { isShallowEqual } from "./is-shallow-equal";
import { SettingsContext } from "./settings-context";
import Card from "../common/Card";
import { useModal } from "@/hooks-test/useModal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Switch from "../form/switch/Switch";
import { usePagesDataStore } from "@/stores-test/pagesDataStore";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";
import { Modal } from "../modal";
import Button from "../button/Button";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useToastStore } from "@/stores/useToastStore";
import { useInterviewStore } from "@/stores/useInterviewStore";
import InterviewModal from "./InterviewModal";

type TColumnState =
  | {
      type: "is-card-over";
      isOverChildCard: boolean;
      dragging: DOMRect;
    }
  | {
      type: "is-column-over";
    }
  | {
      type: "idle";
    }
  | {
      type: "is-dragging";
    };

const stateStyles: { [Key in TColumnState["type"]]: string } = {
  idle: "cursor-grab",
  "is-card-over": "outline-[1px] outline-gray-700",
  "is-dragging": "opacity-40",
  "is-column-over": "bg-slate-900",
};

const idle = { type: "idle" } satisfies TColumnState;

/**
 * A memoized component for rendering out the card.
 *
 * Created so that state changes to the column don't require all cards to be rendered
 */
const CardList = memo(function CardList({ column }: { column: TColumn }) {
  return column.cards.map((card) => (
    <BoardCard key={card.interview.id} card={card} columnId={column.id} />
  ));
});

export function Column({ column }: { column: TColumn }) {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const outerFullHeightRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const { settings } = useContext(SettingsContext);
  const [state, setState] = useState<TColumnState>(idle);
  const [isExistingCandidate, setIsExistingCandidate] = useState(false);
  const candidates = useCompanyStore((state) => state.candidates);
  const interviewTemplates = useCompanyStore((state) => state.templates);
  const roles = useCompanyStore((state) => state.roles);

  useEffect(() => {
    const outer = outerFullHeightRef.current;
    const scrollable = scrollableRef.current;
    const header = headerRef.current;
    const inner = innerRef.current;
    invariant(outer);
    invariant(scrollable);
    invariant(header);
    invariant(inner);

    const data = getColumnData({ column });

    function setIsCardOver({
      data,
      location,
    }: {
      data: TCardData;
      location: DragLocationHistory;
    }) {
      const innerMost = location.current.dropTargets[0];
      const isOverChildCard = Boolean(
        innerMost && isCardDropTargetData(innerMost.data)
      );

      const proposed: TColumnState = {
        type: "is-card-over",
        dragging: data.rect,
        isOverChildCard,
      };
      // optimization - don't update state if we don't need to.
      setState((current) => {
        if (isShallowEqual(proposed, current)) {
          return current;
        }
        return proposed;
      });
    }

    return combine(
      draggable({
        element: header,
        getInitialData: () => data,
        onGenerateDragPreview({ source, location, nativeSetDragImage }) {
          const data = source.data;
          invariant(isColumnData(data));
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: header,
              input: location.current.input,
            }),
            render({ container }) {
              // Simple drag preview generation: just cloning the current element.
              // Not using react for this.
              const rect = inner.getBoundingClientRect();
              const preview = inner.cloneNode(true);
              invariant(preview instanceof HTMLElement);
              preview.style.width = `${rect.width}px`;
              preview.style.height = `${rect.height}px`;

              // rotation of native drag previews does not work in safari
              if (!isSafari()) {
                preview.style.transform = "rotate(4deg)";
              }

              container.appendChild(preview);
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
      dropTargetForElements({
        element: outer,
        getData: () => data,
        canDrop({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getIsSticky: () => true,
        onDragStart({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
          }
        },
        onDragEnter({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
            return;
          }
          if (
            isColumnData(source.data) &&
            source.data.column.id !== column.id
          ) {
            setState({ type: "is-column-over" });
          }
        },
        onDropTargetChange({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
            return;
          }
        },
        onDragLeave({ source }) {
          if (
            isColumnData(source.data) &&
            source.data.column.id === column.id
          ) {
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          return isDraggingACard({ source });
        },
        getConfiguration: () => ({
          maxScrollSpeed: settings.columnScrollSpeed,
        }),
        element: scrollable,
      }),
      unsafeOverflowAutoScrollForElements({
        element: scrollable,
        getConfiguration: () => ({
          maxScrollSpeed: settings.columnScrollSpeed,
        }),
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          if (!settings.isOverflowScrollingEnabled) {
            return false;
          }

          return isDraggingACard({ source });
        },
        getOverflow() {
          return {
            forTopEdge: {
              top: 1000,
            },
            forBottomEdge: {
              bottom: 1000,
            },
          };
        },
      })
    );
  }, [column, settings]);

  const { isOpen, openModal, closeModal } = useModal();

  const [candidate, setCandidate] = useState<{
    id: string | null;
    firstName: string;
    lastName: string;
    email: string;
  }>({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
  });

  const [position, setPosition] = useState("");
  const [interviewTemplateId, setInterviewTemplateId] = useState("");
  const companyId = useCompanyStore((state) => state.companyId);
  const showToast = useToastStore((state) => state.showToast);
  const handleSubmit = async () => {
    const { data } = await api.post(
      `${endpoints.interviews.create(companyId)}`,
      {
        candidate,
        position,
        interviewTemplateId,
      }
    );
    useCompanyStore.setState((state) => ({
      ...state,
      interviews: [...state.interviews, data],
    }));
    closeModal();
    showToast({
      type: "success",
      message: "Interview created successfully",
      title: "Success",
      duration: 3000,
    });
  };

  return (
    <div
      className="flex-auto min-w-[calc(25%-1.5rem*3/4)] p-[1px] flex flex-col"
      ref={outerFullHeightRef}
    >
      <Card
        className={`flex max-h-full flex-col ${stateStyles[state.type]}`}
        ref={innerRef}
      >
        {/* Extra wrapping element to make it easy to toggle visibility of content when a column is dragging over */}
        <div
          className={`flex max-h-full flex-col ${
            state.type === "is-column-over" ? "invisible" : ""
          }`}
        >
          <div
            className="flex flex-row items-center justify-between p-3 pb-2"
            ref={headerRef}
          >
            <div className="pl-2 leading-4">
              {column.title} ({column.cards.length})
            </div>
            <button
              type="button"
              className="rounded p-2 hover:bg-slate-700 active:bg-slate-600"
              aria-label="More actions"
            >
              <Ellipsis size={16} />
            </button>
          </div>
          <div
            className="flex flex-col overflow-y-auto no-scrollbar [overflow-anchor:none] [scrollbar-color:theme(colors.slate.600)_theme(colors.slate.700)] [scrollbar-width:thin] pb-2"
            ref={scrollableRef}
          >
            <CardList column={column} />
            {state.type === "is-card-over" && !state.isOverChildCard ? (
              <div className="flex-shrink-0 px-3 py-1">
                <CardShadow dragging={state.dragging} />
              </div>
            ) : null}
          </div>
          {column.canAdd === true && (
            <div className="flex flex-row gap-2 p-3">
              <button
                type="button"
                className="flex flex-grow flex-row gap-1 rounded p-2 hover:bg-slate-700 active:bg-slate-600"
                onClick={openModal}
              >
                <Plus size={16} />
                <div className="leading-4">Add new interview</div>
              </button>
            </div>
          )}
        </div>
      </Card>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4" key={"testets"}>
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add new interview
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Define the job position you're hiring for and link it to an
              interview template. You can also specify the preferred voice for
              your AI interviewer.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 w-fit">
              <Switch
                label="Existing candidate"
                defaultChecked={isExistingCandidate}
                onChange={() => {
                  if (!isExistingCandidate) {
                    setCandidate((prev) => ({ ...prev, id: null }));
                  } else {
                    setCandidate((prev) => ({
                      ...prev,
                      firstName: "",
                      lastName: "",
                      email: "",
                    }));
                  }
                  setIsExistingCandidate(!isExistingCandidate);
                }}
              />
            </div>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {!isExistingCandidate ? (
                  <>
                    <div>
                      <Label>First Name</Label>
                      <Input
                        type="text"
                        value={candidate.firstName}
                        onChange={(e) =>
                          setCandidate((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Last Name</Label>
                      <Input
                        type="text"
                        value={candidate.lastName}
                        onChange={(e) =>
                          setCandidate((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Email</Label>
                      <Input
                        type="text"
                        value={candidate.email}
                        onChange={(e) =>
                          setCandidate((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <Label>Candidate</Label>
                    <div className="relative">
                      <Select
                        className="pr-8"
                        placeholder="Select candidate"
                        options={candidates
                          .filter((candidate) => candidate.id !== undefined)
                          .map((candidate) => ({
                            value: candidate.id as string,
                            label: `${candidate.firstName} ${candidate.lastName}`,
                          }))}
                        onChange={(value) =>
                          setCandidate((prev) => ({ ...prev, id: value }))
                        }
                      />
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Position</Label>
                  <Input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Interview Template</Label>
                  <div className="relative">
                    <Select
                      className="pr-8"
                      placeholder="Select interview template"
                      options={interviewTemplates
                        .filter(
                          (interviewTemplate) =>
                            interviewTemplate.id !== undefined
                        )
                        .map((interviewTemplate) => ({
                          value: interviewTemplate.id as string,
                          label: interviewTemplate.name,
                        }))}
                      onChange={(value) => setInterviewTemplateId(value)}
                    />
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                size="sm"
                // onClick={() => {
                //   addRole({ ...role, companyId: "cm8l7il910007vgi8ano9wwz1" });
                //   resetForm();
                //   closeModal();
                // }}
                // disabled={!role.title || !role.interviewTemplateId}
                onClick={handleSubmit}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
