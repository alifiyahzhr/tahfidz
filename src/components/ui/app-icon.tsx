import Image from "next/image";
import { clsx } from "clsx";

export function AppIcon({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/ppg.jpeg"
      alt="PPG Australia & New Zealand"
      width={size}
      height={size}
      className={clsx("rounded-xl", className)}
      priority
    />
  );
}
