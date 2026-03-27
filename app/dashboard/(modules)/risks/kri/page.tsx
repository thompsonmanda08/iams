import { getKRIRegisters, getKRIStats } from "@/app/_actions/risk-module-actions";
import KRIRegistersClient from "../_components/register-list";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    page_size?: string;
  }>;
};

export default async function KRIRegistersPage({ searchParams }: PageProps) {
  const { page = "1", page_size = "10" } = await searchParams;
  const kriStats = await getKRIStats();

  const response = await getKRIRegisters({
    page: Number(page),
    page_size: Number(page_size)
  });

  const data = response?.data;
  const registers = data?.data ?? [];
  const pagination = data?.pagination ?? {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  return (
    <KRIRegistersClient
      initialRegisters={registers}
      initialPagination={pagination}
      stats={kriStats.data}
    />
  );
}
