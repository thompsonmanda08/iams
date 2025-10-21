import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

function HomePage({
  children
}: PropsWithChildren & {
  session?: any;
}) {
  return redirect("/login");
}

export default HomePage;
