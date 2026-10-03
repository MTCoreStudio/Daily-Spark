import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Quote } from "@/data/quotes";
import { getQuotes, syncQuotes, getDailyQuote } from "@/lib/quote-service";

export function useQuotes(language?: string) {
  const query = useQuery<Quote[]>({
    queryKey: ["quotes", "data", language],
    queryFn: () => getQuotes(language),
    staleTime: 60_000,
  });

  const queryClient = useQueryClient();
  const refresh = useCallback(async (lang?: string) => {
    const data = await syncQuotes(lang ?? language);
    queryClient.setQueryData<Quote[]>(["quotes", "data", lang ?? language], data);
  }, [queryClient, language]);

  return {
    quotes: query.data ?? [],
    categories: [] as string[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    refresh,
  };
}

export function useDailyQuote() {
  return useQuery<Quote | null>({
    queryKey: ["daily-quote"],
    queryFn: getDailyQuote,
    staleTime: 3_600_000,
  });
}