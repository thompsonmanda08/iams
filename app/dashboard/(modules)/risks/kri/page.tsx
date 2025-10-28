import { getKRIRegisters } from "@/app/_actions/risk-module-actions";
import KRIRegisterList from "../_components/register-list";

export default async function KRIRegistersPage() {
  const response = await getKRIRegisters();
  const registers = response?.data?.data ?? [];

  return <KRIRegisterList initialRegisters={registers} />;
}
