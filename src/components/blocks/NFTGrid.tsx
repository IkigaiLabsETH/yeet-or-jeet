import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";

type NFTCollection = {
  address: string;
  name: string;
  symbol: string;
  floorPrice: number;
  totalVolume: number;
  imageUrl?: string;
};

export function NFTGrid({ onCollectionSelect }: { onCollectionSelect: (address: string) => void }) {
  const { data: collections, isLoading, error } = useQuery({
    queryKey: ["top-nft-collections"],
    queryFn: async () => {
      try {
        // Fetch from Cielo API
        const CIELO_API_BASE = "https://feed-api.cielo.finance/api/v1";
        const apiKey = process.env.NEXT_PUBLIC_CIELO_API_KEY;
        
        console.log("Using API Key:", apiKey ? "Present" : "Missing");
        
        const response = await fetch(`${CIELO_API_BASE}/nft/trending`, {
          headers: {
            accept: "application/json",
            "X-API-KEY": apiKey || "",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch NFT collections: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data);
        
        if (!data.collections || !Array.isArray(data.collections)) {
          console.error("Invalid API response format:", data);
          throw new Error("Invalid API response format");
        }

        return data.collections as NFTCollection[];
      } catch (err) {
        console.error("Error in NFT collection fetch:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="p-6 space-y-4 animate-pulse bg-muted/5"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border-2 border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load NFT collections"}
        </p>
        <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
          {error instanceof Error ? error.stack : "No error details available"}
        </pre>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed p-8 text-center">
        <p className="text-muted-foreground">No NFT collections found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card
          key={collection.address}
          className="p-6 space-y-4 hover:bg-muted/5 transition-colors cursor-pointer"
          onClick={() => onCollectionSelect(collection.address)}
        >
          <div className="flex items-center gap-4">
            {collection.imageUrl ? (
              <div className="relative size-12">
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                {collection.symbol[0]}
              </div>
            )}
            <div>
              <h3 className="font-semibold">{collection.name}</h3>
              <p className="text-sm text-muted-foreground">{collection.symbol}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Floor Price</p>
              <p className="font-medium">
                {formatNumber(collection.floorPrice)} ETH
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">24h Volume</p>
              <p className="font-medium">
                {formatNumber(collection.totalVolume)} ETH
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 