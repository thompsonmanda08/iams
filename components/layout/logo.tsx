import Image from "next/image";

export default function Logo({ src = "/images/infratel-logo.png" }: { src?: string }) {
  return (
    <Image
      src={src}
      width={180}
      height={60}
      className="w-full max-w-32 rounded-[5px] transition-all xl:max-w-48 xl:min-w-32"
      alt="infratel logo"
      unoptimized
    />
  );
}
