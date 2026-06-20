"use client";

import { useState, useEffect, useRef } from "react";
import TextType from "@/components/text-type";
import Image from "next/image";

// ─── محتوای صحنه‌ها ───────────────────────────────────────────────
const SCENES = [
  {
    texts: [
      "بالاخره",
      "بعد از این همه سال",
      "یکی این دروازه رو پیدا کرد",
      "سال‌ها از آخرین باری که اینجا کسی قدم گذاشت میگذره",
    ],
    buttonLabel: "اهم ...",
  },
  {
    texts: [
      "من هنوز منتظر بودم.",
      "منتظر کسی که قرار بود یه روزی برگرده ",
      "منتظر دختری که افسانه‌های این جهان درباره‌اش نوشتن",
      "ولی",
    ],
    buttonLabel: "ولی ؟",
  },
  {
    texts: [
      "من مطمئن نیستم که تو خودش باشی",
      "شاید فقط یک رهگذر باشی",
      "یا شاید ...",
    ],
    buttonLabel: "???",
  },
];

const TYPING_SPEED = 100; // باید با prop یکی باشه

// ─── کامپوننت fade-in ────────────────────────────────────────────
function FadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={className}
      style={{ opacity: visible ? 1 : 0, transition: "opacity 1s ease-in-out" }}
    >
      {children}
    </div>
  );
}

// ─── تابع محاسبه delay آخرین جمله ───────────────────────────────
// چون آخرین جمله هیچ‌وقت delete نمیشه، باید خودمون
// زمان تایپش رو حساب کنیم تا بدونیم کِی دکمه نشون بدیم
function calcLastSentenceDelay(texts: string[], typingSpeed: number) {
  const lastText = texts[texts.length - 1];
  return lastText.length * typingSpeed + 600; // ۶۰۰ms پادینگ اضافه
}

// ─── صفحه اصلی ──────────────────────────────────────────────────
type Stage =
  | "waiting"
  | "image"
  | { scene: number; phase: "typing" | "button" };

export default function Home() {
  const [stage, setStage] = useState<Stage>("waiting");

  // ۳ ثانیه → عکس
  useEffect(() => {
    const t = setTimeout(() => setStage("image"), 3000);
    return () => clearTimeout(t);
  }, []);

  // ۱ ثانیه fade عکس → صحنه اول
  useEffect(() => {
    if (stage !== "image") return;
    const t = setTimeout(() => setStage({ scene: 0, phase: "typing" }), 1000);
    return () => clearTimeout(t);
  }, [stage]);

  // وقتی صحنه‌ای وارد phase=typing میشه،
  // بعد از اتمام تایپ آخرین جمله‌اش، phase رو به button تغییر بده
  useEffect(() => {
    if (typeof stage !== "object" || stage.phase !== "typing") return;

    const currentScene = SCENES[stage.scene];
    const isSingleText = currentScene.texts.length === 1;
    let delay: number;

    if (isSingleText) {
      // اگه فقط یه جمله داریم، onSentenceComplete اصلاً صدا زده نمیشه
      // پس از همون ابتدا زمان تایپ رو حساب می‌کنیم
      delay = calcLastSentenceDelay(currentScene.texts, TYPING_SPEED);
    } else {
      // منتظر onSentenceComplete هستیم — این useEffect فقط fallback نیست
      // (مدیریت اصلی توی handleSentenceComplete هست)
      return;
    }

    const t = setTimeout(() => {
      setStage({ scene: stage.scene, phase: "button" });
    }, delay);

    return () => clearTimeout(t);
  }, [stage]);

  const handleSentenceComplete =
    (sceneIndex: number) => (_: string, sentenceIndex: number) => {
      const currentScene = SCENES[sceneIndex];
      // وقتی جمله ماقبل آخر پاک شد، الان داریم آخرین جمله رو تایپ می‌کنیم
      if (sentenceIndex === currentScene.texts.length - 2) {
        const delay = calcLastSentenceDelay(currentScene.texts, TYPING_SPEED);
        setTimeout(() => {
          setStage({ scene: sceneIndex, phase: "button" });
        }, delay);
      }
    };

  const handleButtonClick = (currentSceneIndex: number) => {
    const nextScene = currentSceneIndex + 1;
    if (nextScene < SCENES.length) {
      setStage({ scene: nextScene, phase: "typing" });
    } else {
      // آخرین صحنه تموم شد — هر کاری که میخوای بکن
      console.log("همه صحنه‌ها تموم شدن!");
    }
  };

  const isImageVisible = stage !== "waiting";
  const currentSceneIndex = typeof stage === "object" ? stage.scene : -1;
  const currentPhase = typeof stage === "object" ? stage.phase : null;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex font-vazirmatn flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        {/* عکس */}
        <div
          style={{
            opacity: isImageVisible ? 1 : 0,
            transition: "opacity 1s ease-in-out",
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

        {/* صحنه فعال */}
        {currentSceneIndex >= 0 && (
          <FadeIn key={`scene-${currentSceneIndex}`}>
            <h1 className="text-3xl">
              <TextType
                key={`texttype-${currentSceneIndex}`}
                text={SCENES[currentSceneIndex].texts}
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

        {/* دکمه */}
        {currentPhase === "button" && (
          <FadeIn key={`button-${currentSceneIndex}`} className="mt-8">
            <button
              onClick={() => handleButtonClick(currentSceneIndex)}
              className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-vazirmatn text-lg"
            >
              {SCENES[currentSceneIndex].buttonLabel}
            </button>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
