import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { CURATED_NFTS, getCollectionIdentifier } from '@/lib/curatedNFTs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from "next/image";
import { formatNumber } from "@/lib/utils";

const CATEGORIES = ['All', 'Gen Art', 'AI', 'Icons', 'Photography'] as const;

interface CollectionStats {
  floorPrice: number;
  totalVolume: number;
  imageUrl: string | null;
}

interface CuratedNFTsGridProps {
  onCollectionSelect: (address: string) => void;
}

export function CuratedNFTsGrid({ onCollectionSelect }: CuratedNFTsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');

  const { data: collectionStats, isLoading, error, refetch } = useQuery({
    queryKey: ["curated-nft-collections"],
    queryFn: async () => {
      try {
        console.log('Fetching stats for curated collections...');
        
        // Fetch stats for all collections in parallel
        const statsPromises = CURATED_NFTS.map(async (nft) => {
          const collectionId = getCollectionIdentifier(nft);
          
          try {
            const response = await fetch(
              `https://api.reservoir.tools/collections/v7/${encodeURIComponent(collectionId)}`,
              {
                headers: {
                  'accept': '*/*',
                  'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR_API_KEY || '',
                },
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch stats for ${nft.name}`);
            }

            const data = await response.json();
            return {
              id: nft.address,
              stats: {
                floorPrice: data.collection?.floorAsk?.price?.amount?.native || 0,
                totalVolume: data.collection?.volume?.allTime || 0,
                imageUrl: data.collection?.image || null
              }
            };
          } catch (error) {
            console.warn(`Error fetching stats for ${nft.name}:`, error);
            return {
              id: nft.address,
              stats: {
                floorPrice: 0,
                totalVolume: 0,
                imageUrl: null
              }
            };
          }
        });

        const results = await Promise.allSettled(statsPromises);
        
        const statsMap = results.reduce((acc, result) => {
          if (result.status === 'fulfilled') {
            acc[result.value.id] = result.value.stats;
          }
          return acc;
        }, {} as Record<string, CollectionStats>);

        return statsMap;
      } catch (error) {
        console.error('Error fetching collection stats:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const filteredCollections = CURATED_NFTS.filter(nft => 
    selectedCategory === 'All' || nft.category === selectedCategory
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border-2 border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load NFT collections"}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCollections.map((nft) => (
          <Card
            key={nft.address}
            className="p-6 space-y-4 hover:bg-muted/5 transition-colors cursor-pointer"
            onClick={() => onCollectionSelect(nft.address)}
          >
            <div className="flex items-center gap-4">
              {typeof collectionStats?.[nft.address]?.imageUrl === 'string' ? (
                <div className="relative size-12 shrink-0">
                  <Image
                    src={collectionStats[nft.address].imageUrl as string}
                    alt={nft.name}
                    fill
                    className="rounded-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="size-12 rounded-full bg-muted flex items-center justify-center text-2xl font-bold shrink-0">
                  {nft.symbol[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{nft.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{nft.symbol}</p>
              </div>
              <Badge variant="secondary">{nft.category}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Floor Price</p>
                <p className="font-medium">
                  {formatNumber(collectionStats?.[nft.address]?.floorPrice || 0)} ETH
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Total Volume</p>
                <p className="font-medium">
                  {formatNumber(collectionStats?.[nft.address]?.totalVolume || 0)} ETH
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
} 