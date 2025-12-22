import Image from "next/image";

export default function Logo({ src = "/images/infratel-logo.png" }: { src?: string }) {
  return (
    <Image
      src={src}
      width={100}
      height={48}
      className="me-1 w-24 rounded-[5px] transition-all"
      alt="infratel logo"
      unoptimized
    />
  );
}
