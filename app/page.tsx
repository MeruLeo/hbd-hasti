"use client";

import { useState, useEffect } from "react";
import TextType from "@/components/text-type";
import Image from "next/image";

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

// ─── Stage ────────────────────────────────────────────────────────
// FIX 1: "done" از phase خارج شد و به stage اضافه شد
type Stage =
  | "waiting"
  | "image-in"
  | { scene: number; phase: "typing" | "button" }
  | "image-out"
  | "done";

// ─── Helpers ──────────────────────────────────────────────────────
function calcLastSentenceDelay(texts: string[], typingSpeed: number) {
  return texts[texts.length - 1].length * typingSpeed + 600;
}

function getNextPhase(scene: Scene): "button" | "done" {
  return "buttonLabel" in scene && scene.buttonLabel ? "button" : "done";
}

// ─── FadeIn wrapper ───────────────────────────────────────────────
function FadeIn({
  children,
  className = "",
  duration = 1000,
  delay = 50,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
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

  // ۳ ثانیه → fade in عکس
  useEffect(() => {
    const t = setTimeout(() => {
      setStage("image-in");
      setImageOpacity(1);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // ۱ ثانیه بعد از fade in عکس → صحنه اول
  useEffect(() => {
    if (stage !== "image-in") return;
    const t = setTimeout(() => setStage({ scene: 0, phase: "typing" }), 1000);
    return () => clearTimeout(t);
  }, [stage]);

  // FIX 2: setImageOpacity داخل setTimeout تا cascading render نداشته باشیم
  useEffect(() => {
    if (typeof stage !== "object" || stage.phase !== "typing") return;
    const currentScene = SCENES[stage.scene];
    if (currentScene.type !== "dramatic") return;

    const t = setTimeout(() => setImageOpacity(0), 0);
    return () => clearTimeout(t);
  }, [stage]);

  // FIX 3: تک‌جمله‌ای — حالا getNextPhase درست "button" یا "done" برمیگردونه
  useEffect(() => {
    if (typeof stage !== "object" || stage.phase !== "typing") return;
    const currentScene = SCENES[stage.scene];
    if (currentScene.texts.length !== 1) return;

    const delay = calcLastSentenceDelay(currentScene.texts, TYPING_SPEED);
    const t = setTimeout(() => {
      setStage({ scene: stage.scene, phase: getNextPhase(currentScene) });
    }, delay);
    return () => clearTimeout(t);
  }, [stage]);

  // چند‌جمله‌ای — وقتی جمله ماقبل آخر پاک شد
  const handleSentenceComplete =
    (sceneIndex: number) => (_: string, sentenceIndex: number) => {
      const currentScene = SCENES[sceneIndex];
      if (sentenceIndex !== currentScene.texts.length - 2) return;

      const delay = calcLastSentenceDelay(currentScene.texts, TYPING_SPEED);
      setTimeout(() => {
        setStage({ scene: sceneIndex, phase: getNextPhase(currentScene) });
      }, delay);
    };

  const handleButtonClick = (currentSceneIndex: number) => {
    const nextIndex = currentSceneIndex + 1;
    if (nextIndex < SCENES.length) {
      setStage({ scene: nextIndex, phase: "typing" });
    } else {
      setStage("done");
    }
  };

  const currentSceneIndex = typeof stage === "object" ? stage.scene : -1;
  const currentPhase = typeof stage === "object" ? stage.phase : null;
  const currentScene =
    currentSceneIndex >= 0 ? SCENES[currentSceneIndex] : null;
  const isDramatic = currentScene?.type === "dramatic";

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex font-vazirmatn flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
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

        {/* with-image متن */}
        {currentScene?.type === "with-image" && (
          <FadeIn key={`scene-${currentSceneIndex}`}>
            <h1 className="text-3xl">
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

        {/* dramatic متن */}
        {currentScene?.type === "dramatic" && (
          <FadeIn
            key={`dramatic-${currentSceneIndex}`}
            delay={800}
            duration={1500}
            className="flex flex-col items-center w-full text-center mt-8"
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
                typingSpeed={currentScene.emphasis ? 120 : TYPING_SPEED}
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
        {currentPhase === "button" && currentScene && (
          <FadeIn
            key={`btn-${currentSceneIndex}`}
            className={`mt-10 ${isDramatic ? "self-center" : ""}`}
          >
            <button
              onClick={() => handleButtonClick(currentSceneIndex)}
              className={`px-8 py-3 font-vazirmatn text-lg rounded-full transition-all duration-300
              ${
                isDramatic
                  ? "border border-black/20 text-black bg-black/5 hover:bg-black/10 dark:border-white/30 dark:text-white dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm"
                  : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
              }`}
            >
              {"buttonLabel" in currentScene && currentScene.buttonLabel}
            </button>
          </FadeIn>
        )}

        {/* صحنه پایانی */}
        {stage === "done" && (
          <FadeIn
            className="flex flex-col items-center w-full text-center mt-16"
            delay={300}
          >
            <p className="text-2xl opacity-60">...</p>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
