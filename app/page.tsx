"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  afterTyping?: "password" | "done";
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
      "من این همه سال منتظر بودم",
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
    texts: ["تو همونی هستی که قرن ها منتظرش بودیم"],
    buttonLabel: "من؟",
  },
  {
    type: "dramatic",
    texts: ["واسه اینکه حقیقت رو بفهمی", "راه رو ادامه بده"],
    buttonLabel: "ادامه",
  },
  {
    type: "with-image",
    texts: [
      "صبر کن",
      "قبل ازینکه جلوتر بری، باید یچیزیو بدونی",
      "اینجا یه مکان معمولی نیست ...",
      "اینجا داستان کسیه که خورشید نشونه هاشو روی موهاش جا گذاشته",
      "پس هرکسی نمیتونه واردش شه",
    ],
    buttonLabel: "ولی من قراره واردش بشم",
  },
  {
    type: "with-image",
    texts: [
      "نویسنده برای اینکه",
      "هیچکس بجز اون دختر نتونه واردش بشه",
      "یک رمز برای این جهان ساخته",
      "رمزی که فقط صاحب واقعی این داستان میتونه دریافتش کنه",
    ],
    buttonLabel: "رمز رو پیدا میکنم",
  },
  {
    type: "dramatic",
    emphasis: true,
    texts: [
      "حواست باشه اون طرف دیوار یک دنیای فراموش شدست",
      "نویسنده رو پیدا کن",
      "رمز دست اونه",
    ],
    afterTyping: "password",
  },
];

const TYPING_SPEED = 100;
const EMPHASIS_TYPING_SPEED = 120;
const CORRECT_PASSWORD = "1234";
const NEXT_ROUTE = "/world";

// ─── Stage ────────────────────────────────────────────────────────
type SceneStage = {
  scene: number;
  phase: "typing" | "button";
};

type Stage =
  | "waiting"
  | "image-in"
  | "image-out"
  | "password"
  | "done"
  | SceneStage;

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

  if (scene.type === "dramatic" && scene.afterTyping) {
    return scene.afterTyping;
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
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("waiting");
  const [imageOpacity, setImageOpacity] = useState(0);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const sentenceTimerRef = useRef<number | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

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

  // بعد از ورود صفحه، عکس fade in می‌شود.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStage("image-in");
      setImageOpacity(1);
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // بعد از fade in عکس، صحنه اول شروع می‌شود.
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

  // وقتی فرم رمز نمایش داده شد، فوکوس روی input می‌رود.
  useEffect(() => {
    if (stage !== "password") return;

    const timer = window.setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [stage]);

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

  const handlePasswordSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const normalizedPassword = password.trim();

      if (normalizedPassword !== CORRECT_PASSWORD) {
        setPasswordError("رمز درست نیست. دوباره امتحان کن.");
        setPassword("");
        return;
      }

      setPasswordError("");
      setIsNavigating(true);
      router.push(NEXT_ROUTE);
    },
    [password, router],
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);

      if (passwordError) {
        setPasswordError("");
      }
    },
    [passwordError],
  );

  const currentSceneIndex = isSceneStage(stage) ? stage.scene : -1;
  const currentPhase = isSceneStage(stage) ? stage.phase : null;
  const currentScene =
    currentSceneIndex >= 0 ? SCENES[currentSceneIndex] : null;
  const isDramatic = currentScene?.type === "dramatic";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center bg-white px-6 py-24 font-vazirmatn dark:bg-black sm:px-16 sm:py-32 sm:items-start">
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
                  ? "text-4xl font-bold leading-relaxed tracking-tight sm:text-5xl"
                  : "text-3xl leading-loose sm:text-4xl"
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

        {/* فرم رمز */}
        {stage === "password" && (
          <FadeIn
            key="password-form"
            delay={250}
            duration={1200}
            className="mt-12 flex w-full flex-col items-center text-center"
          >
            <form
              onSubmit={handlePasswordSubmit}
              className="flex w-full max-w-sm flex-col items-center gap-5"
            >
              <div className="space-y-2">
                <p className="text-2xl font-bold">رمز دروازه</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  رمز را وارد کن تا مسیر بعدی باز شود.
                </p>
              </div>

              <input
                ref={passwordInputRef}
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••"
                disabled={isNavigating}
                className="w-full rounded-2xl border border-black/15 bg-white px-5 py-4 text-center text-2xl tracking-[0.4em] text-black outline-none transition-all duration-300 placeholder:text-zinc-300 focus:border-black focus:ring-4 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white dark:focus:ring-white/10"
              />

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              <button
                type="submit"
                disabled={isNavigating || password.trim().length === 0}
                className="rounded-full bg-black px-8 py-3 text-lg text-white transition-all duration-300 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
              >
                {isNavigating ? "در حال عبور..." : "باز کردن دروازه"}
              </button>
            </form>
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
