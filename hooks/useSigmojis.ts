import { loadSigmojis } from "@/lib/localStorage";
import { useQuery } from "react-query";
import { Sigmoji } from "@/lib/types";

export const useSigmojis = () => {
  return useQuery(
    ["sigmojis"],
    async (): Promise<Sigmoji[]> => {
      const sigmojis = await loadSigmojis();
      return sigmojis;
    },
    {
      refetchOnWindowFocus: false,
    }
  );
};
