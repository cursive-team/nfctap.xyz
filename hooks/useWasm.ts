import { ProverWasm, initWasm, setupTree } from "@/lib/zkProving";
import { useQuery } from "react-query";
import { Tree } from "@personaelabs/spartan-ecdsa";

interface UseWasmInterface {
  wasm: ProverWasm
  pubKeyTree: Tree
}

export const useWasm = () => {
  return useQuery(
    ["wasm"],
    async (): Promise<UseWasmInterface> => {
      
      const wasm = await initWasm();
      const pubKeyTree = setupTree(wasm);

      return {
        wasm,
        pubKeyTree
      }
    },
    {
      refetchOnWindowFocus: false,
    }
  );
};
