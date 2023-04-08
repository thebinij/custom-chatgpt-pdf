export interface PineConeVar {
    apikey:string;
    index:string;
    projectId?:string;
    nameSpace?:string;
    environment:string;
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

