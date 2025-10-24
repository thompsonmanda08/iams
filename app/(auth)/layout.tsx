import Image from "next/image";
import { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative grid h-screen place-items-center p-4">
      <div className="gradient absolute inset-0">
        <Image
          className="a a h-full w-full object-cover"
          src={"/images/cover.webp"}
          alt="auth-cover-img"
          width={1920}
          height={1080}
        />
      </div>
      <div className="gradient absolute inset-0 grid opacity-80" />
      <div className="z-30 ">{children}</div>
    </div>
  );
}
