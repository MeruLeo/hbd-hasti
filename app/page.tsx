"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import TextType from "@/components/text-type";

// ─── نوع‌های صحنه ────────────────────────────────────────────────
type SceneWithImage = {
  type: "with-image";
  texts: string[];
  buttonLabel: string;
};

type SceneDramatic = {
  type: "dramatic";
  texts: string[];
  buttonLabel?: string;
  emphasis?: boolean;
};

type Scene = SceneWithImage | SceneDramatic;

// ─── داده‌ها ──────────────────────────────────────────────────────
const SCENES: Scene[] = [
  {
    type: "with-image",
    texts: [
      "بالاخره",
      "بعد از این همه سال",
      "یکی این دروازه رو پیدا کرد",
      "سال‌ها از آخرین باری که اینجا کسی قدم گذاشت میگذره",
    ],
    buttonLabel: "اهم ...",
  },
  {
    type: "with-image",
    texts: [
      "من هنوز منتظر بودم.",
      "منتظر کسی که قرار بود یه روزی برگرده",
      "منتظر دختری که افسانه‌های این جهان درباره‌اش نوشتن",
      "ولی",
    ],
    buttonLabel: "ولی ؟",
  },
  {
    type: "with-image",
    texts: [
      "من مطمئن نیستم که تو خودش باشی",
      "شاید فقط یک رهگذر باشی",
      "یا شاید ...",
    ],
    buttonLabel: "???",
  },
  {
    type: "dramatic",
    emphasis: true,
    texts: ["تو همونی هستی که منتظرش بودم."],
    buttonLabel: "من؟",
  },
  {
    type: "dramatic",
    texts: ["آره.", "فقط تو میتونستی این دروازه رو پیدا کنی", "این تصادف نبود"],
    buttonLabel: "ادامه بده",
  },
  {
    type: "dramatic",
    emphasis: true,
    texts: ["حالا وقتشه که همه‌چیز رو بدونی."],
  },
];

const TYPING_SPEED = 100;
const EMPHASIS_TYPING_SPEED = 120;

// ─── Stage ────────────────────────────────────────────────────────
type SceneStage = {
  scene: number;
  phase: "typing" | "button";
};

type Stage = "waiting" | "image-in" | "image-out" | "done" | SceneStage;

// ─── Helpers ──────────────────────────────────────────────────────
function isSceneStage(stage: Stage): stage is SceneStage {
  return typeof stage === "object";
}

function hasButton(scene: Scene) {
  return "buttonLabel" in scene && Boolean(scene.buttonLabel);
}

function getTypingSpeed(scene: Scene) {
  return scene.type === "dramatic" && scene.emphasis
    ? EMPHASIS_TYPING_SPEED
    : TYPING_SPEED;
}

function calcLastSentenceDelay(texts: string[], typingSpeed: number) {
  const lastSentence = texts[texts.length - 1] ?? "";
  return lastSentence.length * typingSpeed + 600;
}

function getStageAfterTyping(sceneIndex: number): Stage {
  const scene = SCENES[sceneIndex];

  if (!scene) {
    return "done";
  }

  if (hasButton(scene)) {
    return {
      scene: sceneIndex,
      phase: "button",
    };
  }

  return "done";
}

// ─── FadeIn wrapper ───────────────────────────────────────────────
function FadeIn({
  children,
  className = "",
  duration = 1000,
  delay = 50,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  );
}

// ─── صفحه اصلی ───────────────────────────────────────────────────
export default function Home() {
  const [stage, setStage] = useState<Stage>("waiting");
  const [imageOpacity, setImageOpacity] = useState(0);

  const sentenceTimerRef = useRef<number | null>(null);

  const clearSentenceTimer = useCallback(() => {
    if (sentenceTimerRef.current !== null) {
      window.clearTimeout(sentenceTimerRef.current);
      sentenceTimerRef.current = null;
    }
  }, []);

  const scheduleStageAfterTyping = useCallback(
    (sceneIndex: number) => {
      clearSentenceTimer();

      const scene = SCENES[sceneIndex];
      const delay = scene
        ? calcLastSentenceDelay(scene.texts, getTypingSpeed(scene))
        : 0;

      sentenceTimerRef.current = window.setTimeout(() => {
        setStage(getStageAfterTyping(sceneIndex));
        sentenceTimerRef.current = null;
      }, delay);
    },
    [clearSentenceTimer],
  );

  // ۳ ثانیه بعد از ورود صفحه، عکس fade in می‌شود.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStage("image-in");
      setImageOpacity(1);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // ۱ ثانیه بعد از fade in عکس، صحنه اول شروع می‌شود.
  useEffect(() => {
    if (stage !== "image-in") return;

    const timer = window.setTimeout(() => {
      setStage({
        scene: 0,
        phase: "typing",
      });
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [stage]);

  // در صحنه‌های dramatic، عکس به‌آرامی حذف می‌شود.
  useEffect(() => {
    if (!isSceneStage(stage) || stage.phase !== "typing") return;

    const currentScene = SCENES[stage.scene];

    if (!currentScene || currentScene.type !== "dramatic") return;

    const timer = window.setTimeout(() => {
      setImageOpacity(0);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [stage]);

  // صحنه‌های تک‌جمله‌ای onSentenceComplete قابل‌اعتماد ندارند،
  // بنابراین پایان تایپ آن‌ها با تایمر کنترل می‌شود.
  useEffect(() => {
    if (!isSceneStage(stage) || stage.phase !== "typing") return;

    const currentScene = SCENES[stage.scene];

    if (!currentScene || currentScene.texts.length !== 1) return;

    scheduleStageAfterTyping(stage.scene);

    return () => {
      clearSentenceTimer();
    };
  }, [stage, scheduleStageAfterTyping, clearSentenceTimer]);

  // صحنه‌های چندجمله‌ای: بعد از پایان جمله ماقبل آخر، زمان لازم برای جمله آخر محاسبه می‌شود.
  const handleSentenceComplete = useCallback(
    (sceneIndex: number) => (_sentence: string, sentenceIndex: number) => {
      const currentScene = SCENES[sceneIndex];

      if (!currentScene) return;
      if (currentScene.texts.length <= 1) return;
      if (sentenceIndex !== currentScene.texts.length - 2) return;

      scheduleStageAfterTyping(sceneIndex);
    },
    [scheduleStageAfterTyping],
  );

  const handleButtonClick = useCallback(
    (currentSceneIndex: number) => {
      clearSentenceTimer();

      const nextIndex = currentSceneIndex + 1;

      if (nextIndex < SCENES.length) {
        setStage({
          scene: nextIndex,
          phase: "typing",
        });
      } else {
        setStage("done");
      }
    },
    [clearSentenceTimer],
  );

  const currentSceneIndex = isSceneStage(stage) ? stage.scene : -1;
  const currentPhase = isSceneStage(stage) ? stage.phase : null;
  const currentScene =
    currentSceneIndex >= 0 ? SCENES[currentSceneIndex] : null;
  const isDramatic = currentScene?.type === "dramatic";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center bg-white px-16 py-32 font-vazirmatn dark:bg-black sm:items-start">
        {/* عکس */}
        <div
          style={{
            opacity: imageOpacity,
            transition: "opacity 1.2s ease-in-out",
            maxHeight: imageOpacity === 0 && isDramatic ? "0px" : undefined,
            overflow: "hidden",
          }}
        >
          <Image
            src="/hirono/main.webp"
            alt="Hirono"
            width={1500}
            height={1500}
            priority
          />
        </div>

        {/* متن‌های همراه با عکس */}
        {currentScene?.type === "with-image" && (
          <FadeIn key={`scene-${currentSceneIndex}`}>
            <h1 className="text-3xl leading-relaxed">
              <TextType
                key={`tt-${currentSceneIndex}`}
                text={currentScene.texts}
                typingSpeed={TYPING_SPEED}
                loop={false}
                pauseDuration={500}
                showCursor
                cursorCharacter="|"
                deletingSpeed={50}
                cursorBlinkDuration={0.5}
                onSentenceComplete={handleSentenceComplete(currentSceneIndex)}
              />
            </h1>
          </FadeIn>
        )}

        {/* متن‌های dramatic */}
        {currentScene?.type === "dramatic" && (
          <FadeIn
            key={`dramatic-${currentSceneIndex}`}
            delay={800}
            duration={1500}
            className="mt-8 flex w-full flex-col items-center text-center"
          >
            <h1
              className={
                currentScene.emphasis
                  ? "text-5xl font-bold leading-relaxed tracking-tight"
                  : "text-4xl leading-loose"
              }
            >
              <TextType
                key={`tt-dramatic-${currentSceneIndex}`}
                text={currentScene.texts}
                typingSpeed={getTypingSpeed(currentScene)}
                loop={false}
                pauseDuration={600}
                showCursor
                cursorCharacter="█"
                deletingSpeed={40}
                cursorBlinkDuration={0.7}
                onSentenceComplete={handleSentenceComplete(currentSceneIndex)}
              />
            </h1>
          </FadeIn>
        )}

        {/* دکمه */}
        {currentPhase === "button" &&
          currentScene &&
          hasButton(currentScene) && (
            <FadeIn
              key={`btn-${currentSceneIndex}`}
              className={`mt-10 ${isDramatic ? "self-center" : ""}`}
            >
              <button
                type="button"
                onClick={() => handleButtonClick(currentSceneIndex)}
                className={`rounded-full px-8 py-3 font-vazirmatn text-lg transition-all duration-300 ${
                  isDramatic
                    ? "border border-black/20 bg-black/5 text-black backdrop-blur-sm hover:bg-black/10 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    : "bg-black text-white hover:opacity-80 dark:bg-white dark:text-black"
                }`}
              >
                {currentScene.buttonLabel}
              </button>
            </FadeIn>
          )}

        {/* صحنه پایانی */}
        {stage === "done" && (
          <FadeIn
            className="mt-16 flex w-full flex-col items-center text-center"
            delay={300}
          >
            <p className="text-2xl opacity-60">...</p>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
