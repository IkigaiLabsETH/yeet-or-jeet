import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { getTrendingCollections, type ReservoirCollection } from "@/lib/reservoir";

export function NFTGrid({ onCollectionSelect }: { onCollectionSelect: (address: string) => void }) {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Reservoir API Key present:', !!process.env.NEXT_PUBLIC_RESERVOIR_API_KEY);

  const { data: collections, isLoading, error } = useQuery({
    queryKey: ["top-nft-collections"],
    queryFn: async () => {
      try {
        console.log('Fetching NFT collections...');
        const reservoirCollections = await getTrendingCollections(12);
        console.log('Received collections:', reservoirCollections?.length || 0);
        
        // Map Reservoir data to include only the fields we need
        return reservoirCollections.map((collection: ReservoirCollection) => ({
          address: collection.primaryContract,
          name: collection.name,
          symbol: collection.symbol,
          floorPrice: collection.floorAsk?.price?.amount?.native || 0,
          totalVolume: collection.volume24h || 0,
          imageUrl: collection.image,
        }));
      } catch (err) {
        console.error("Error in NFT collection fetch:", err);
        
        // Only use mock data in production if fetch fails
        if (process.env.NODE_ENV === 'production') {
          console.log("Production environment detected, using mock data");
          return [{
            address: "0x1234...",
            name: "Test Collection",
            symbol: "TEST",
            floorPrice: 1.5,
            totalVolume: 100,
            imageUrl: null
          }];
        }
        
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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
    console.error("Render Error:", error);
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
                  unoptimized
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