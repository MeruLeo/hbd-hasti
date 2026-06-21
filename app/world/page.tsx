import { Section } from "@/components/section";
import { LampContainer } from "@/components/ui/lamp";
import { Spotlight } from "@/components/ui/spotlight";
import Image from "next/image";
import Link from "next/link";

export default function WorldPage() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-black text-white">
      <section className="my-8">
        <h1>太陽を盗んだ少女</h1>
      </section>
      <main className="flex gap-16 flex-col items-center">
        <div className="flex  flex-col items-center">
          <Section
            title="آغاز داستان"
            story={`سال‌ها پیش، در روزی که هیچ‌کس آن را به خاطر نمی‌آورد، دختری چشم به جهان گشود.

تولد او شبیه دیگران بود.

هیچ ستاره‌ای سقوط نکرد.

هیچ طوفانی برنخاست.

هیچ پیشگویی‌ای نوشته نشد.

برای همین، همه فکر کردند او یک انسان معمولی است.

اما افسانه‌ها همیشه از آرام‌ترین نقطه‌ها آغاز می‌شوند.

و هیچ‌کس نمی‌دانست که داستان این جهان، قرار است روزی به نام او گره بخورد.`}
            img="/hirono/main.webp"
          />
          <Image
            src="/hasti/1.webp"
            alt="Hasti"
            className="rounded-3xl"
            width={400}
            height={400}
            priority
          />
        </div>

        <div className="flex  flex-col items-center">
          <Section
            title="دختری که نور خورشید را دزدید"
            story={`سال‌ها گذشت.

تا اینکه خورشید متوجه چیزی عجیب شد.

هر بار که پرتوهایش روی موهای آن دختر می‌نشستند، بخشی از رنگ خود را از دست می‌دادند.

ابتدا تصور کرد یک اشتباه است.

اما اشتباه نبود.

دختر، ناخواسته تکه‌هایی از نور خورشید را با خود حمل می‌کرد.

و از آن روز به بعد، هرگاه زیر نور می‌ایستاد، موهایش راز کوچکی را فاش می‌کردند.

رازی که فقط خورشید از آن خبر داشت.`}
            img="/hirono/2.webp"
          />
          <Image
            src="/hasti/2.webp"
            alt="Hasti"
            className="rounded-3xl"
            width={400}
            height={400}
            priority
          />
        </div>

        <div className="flex  flex-col items-center">
          <Section
            title="نشانه سرخ و رد سپید ماه"
            story={`خورشید تنها موجودی نبود که او را زیر نظر داشت.

ماه نیز نام او را شنیده بود.

می‌گویند شبی میان ماه و خورشید بر سر نگهبانی از این دختر اختلافی شکل گرفت.

هیچ‌کس نمی‌داند چه گذشت.

اما پس از آن شب، دو نشانه برای همیشه باقی ماند.

یکی مُهری سرخ بر دست چپش.

یادگاری از آتش خورشید.

و دیگری ردی سپید بر صورتش.

یادگاری از لمس انگشتان ماه.

از آن زمان، هر دو آسمان می‌دانستند که او دیگر یک انسان معمولی نیست.`}
            img="/hirono/3.webp"
          />
          <Image
            src="/hasti/4.webp"
            alt="Hasti"
            className="rounded-3xl"
            width={400}
            height={400}
            priority
          />
        </div>

        <div className="flex  flex-col items-center">
          <Section
            title="امروز"
            story={`افسانه‌ها معمولاً با «پایان» تمام می‌شوند.

اما این یکی هنوز به آنجا نرسیده است.

دختری که روزی نور خورشید را با خود برد.

دختری که نشان خورشید و ماه را همزمان بر تن داشت.

اکنون اینجاست.

در سوی دیگر این صفحه.

در حال خواندن داستانی که همیشه درباره خودش بوده است.

و شاید...

بهترین فصل این افسانه هنوز نوشته نشده باشد.`}
            img="/objs/star.webp"
          />
        </div>
      </main>

      <footer className="m-8">
        <Link
          href={`/author`}
          className="bg-zinc-50 p-4 w-full text-center text-zinc-950 dark:bg-black dark:text-zinc-50 rounded-full"
        >
          آخرین نامه نویسنده
        </Link>
      </footer>
    </main>
  );
}
