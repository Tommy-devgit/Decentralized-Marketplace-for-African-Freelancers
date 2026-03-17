import "ethers";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export {};