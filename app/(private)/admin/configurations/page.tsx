import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCountries } from "@/app/_actions/backoffice-actions";
import PageHeader from "@/components/page-header";
import { CountriesTab } from "./_components/countries-tab";
import { ProvincesTab } from "./_components/provinces-tab";
import { TownsTab } from "./_components/towns-tab";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string }>;
};

export default async function AdminConfigurationsPage({ searchParams }: PageProps) {
  const urlParams = await searchParams;
  const page = urlParams.page ? Number(urlParams.page) : 1;
  const page_size = urlParams.page_size ? Number(urlParams.page_size) : 10;

  // Fetch countries for admin configurations
  const countriesResponse = await getCountries({ page, page_size });
  const countries = countriesResponse.success ? countriesResponse.data : [];
  const countriesPagination = countriesResponse.success && countriesResponse.pagination ? {
    total: countriesResponse.pagination.total || 0,
    page: countriesResponse.pagination.page || 1,
    page_size: countriesResponse.pagination.page_size || 10,
    total_pages: countriesResponse.pagination.total_pages || 0,
    has_next: countriesResponse.pagination.has_next || false,
    has_prev: countriesResponse.pagination.has_prev || false
  } : undefined;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <PageHeader
        title="Global Location Configurations"
        description="Manage countries, provinces/states, and towns across your global operations"
        icon="MapPin"
      />

      <div>
        <Tabs defaultValue="countries" className="space-y-6">
          <TabsList>
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="provinces">Provinces / States</TabsTrigger>
            <TabsTrigger value="towns">Towns / Cities</TabsTrigger>
          </TabsList>

          {/* Countries Tab */}
          <TabsContent value="countries">
            <CountriesTab initialCountries={countries} initialPagination={countriesPagination} />
          </TabsContent>

          {/* Provinces Tab */}
          <TabsContent value="provinces">
            <ProvincesTab countries={countries} />
          </TabsContent>

          {/* Towns Tab */}
          <TabsContent value="towns">
            <TownsTab countries={countries} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
