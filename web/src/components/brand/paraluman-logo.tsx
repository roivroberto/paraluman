import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ParalumanLogo({
  href,
  className,
}: {
  href?: string;
  className?: string;
}) {
  const image = (
    <Image
      alt="Paraluman"
      className={cn("h-auto w-[168px]", className)}
      height={64}
      priority
      src="/branding/paraluman-logo.avif"
      width={320}
    />
  );

  if (!href) {
    return image;
  }

  return <Link href={href}>{image}</Link>;
}
