import { h3 } from "motion/react-client";
import Image from "next/image";

export interface SectionProps {
  title: string;
  story: string;
  img: string;
}

export const Section = ({ title, story, img }: SectionProps) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-5xl font-bold">{title}</h3>
      <p className="bg-zinc-900 p-4 rounded-3xl">{story}</p>
      <Image
        className="absolute left-0"
        src={img}
        alt="obj"
        width={100}
        height={100}
        priority
      />
    </div>
  );
};
