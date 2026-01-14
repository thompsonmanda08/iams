import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchInitialReport, fetchFindings, fetchDataSources, saveReport } from "../actions";
import { useReportStore } from "../store";
import { useEffect } from "react";

export function useReportFetching() {
  const { setReport, setFindings, setDataSources, setLoading } = useReportStore();

  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ["report", "initial"],
    queryFn: fetchInitialReport
  });

  const { data: findingsData, isLoading: isFindingsLoading } = useQuery({
    queryKey: ["findings"],
    queryFn: () => fetchFindings()
  });

  const { data: dataSourcesData, isLoading: isDataSourcesLoading } = useQuery({
    queryKey: ["dataSources"],
    queryFn: fetchDataSources
  });

  // Sync with store
  useEffect(() => {
    if (reportData) setReport(reportData);
  }, [reportData, setReport]);

  useEffect(() => {
    if (findingsData) setFindings(findingsData);
  }, [findingsData, setFindings]);

  useEffect(() => {
    if (dataSourcesData) setDataSources(dataSourcesData);
  }, [dataSourcesData, setDataSources]);

  useEffect(() => {
    setLoading(isReportLoading || isFindingsLoading || isDataSourcesLoading);
  }, [isReportLoading, isFindingsLoading, isDataSourcesLoading, setLoading]);

  const saveMutation = useMutation({
    mutationFn: saveReport,
    onSuccess: (data) => {
      // Use toast or alert
      alert("Report saved successfully!");
    },
    onError: (error) => {
      alert("Failed to save report.");
    }
  });

  return {
    saveReport: saveMutation.mutate
  };
}
