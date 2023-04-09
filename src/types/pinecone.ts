export interface PineConeEnv {
    apikey:string;
    indexURL:string;
  }
  interface NamespaceInfo {
    vectorCount: number;
  }
  export interface PineconeStats {
    namespaces: Record<string, NamespaceInfo>;
    dimension: string;
    indexFullness: number; 
    totalVectorCount: number;
  }

