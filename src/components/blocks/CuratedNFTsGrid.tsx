import { useState, useEffect } from 'react';
import { CURATED_NFTS, getCollectionIdentifier } from '@/lib/curatedNFTs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES = ['All', 'Gen Art', 'AI', 'Icons', 'Photography'] as const;

interface CollectionStats {
  floorPrice: string;
  totalVolume: string;
}

interface CuratedNFTsGridProps {
  onCollectionSelect: (address: string) => void;
}

export function CuratedNFTsGrid({ onCollectionSelect }: CuratedNFTsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');
  const [collectionStats, setCollectionStats] = useState<Record<string, CollectionStats>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const filteredCollections = CURATED_NFTS.filter(nft => 
    selectedCategory === 'All' || nft.category === selectedCategory
  );

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function fetchCollectionStats() {
      setLoading(true);
      try {
        // Fetch stats for all collections in parallel with rate limiting
        const statsPromises = CURATED_NFTS.map(async (nft) => {
          const collectionId = getCollectionIdentifier(nft);
          
          try {
            const response = await fetch(`/api/reservoir/stats?collectionId=${encodeURIComponent(collectionId)}`, {
              signal: controller.signal
            });

            if (!response.ok) {
              if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few seconds.');
              }
              throw new Error(`Failed to fetch stats for ${nft.name}`);
            }

            const data = await response.json();
            return {
              id: nft.address,
              stats: {
                floorPrice: data.stats?.floorPrice || 'N/A',
                totalVolume: data.stats?.totalVolume || 'N/A'
              }
            };
          } catch (error) {
            console.warn(`Error fetching stats for ${nft.name}:`, error);
            return {
              id: nft.address,
              stats: {
                floorPrice: 'N/A',
                totalVolume: 'N/A'
              }
            };
          }
        });

        // Use Promise.allSettled to handle partial failures
        const results = await Promise.allSettled(statsPromises);
        
        if (!isMounted) return;

        const statsMap = results.reduce((acc, result) => {
          if (result.status === 'fulfilled') {
            acc[result.value.id] = result.value.stats;
          }
          return acc;
        }, {} as Record<string, CollectionStats>);

        setCollectionStats(statsMap);
      } catch (error) {
        console.error('Error fetching collection stats:', error);
        toast({
          title: "Error",
          description: "Failed to fetch collection statistics. Please try again later.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCollectionStats();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [toast]); // Only fetch once when component mounts

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
            className="overflow-hidden hover:border-primary transition-all duration-200"
          >
            <button
              onClick={() => onCollectionSelect(nft.address)}
              className="w-full text-left"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{nft.name}</h3>
                    <p className="text-sm text-muted-foreground">{nft.symbol}</p>
                  </div>
                  <Badge variant="secondary">{nft.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Floor Price</p>
                    {loading ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <p className="font-medium">
                        {collectionStats[nft.address]?.floorPrice ?? 'N/A'} ETH
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Total Volume</p>
                    {loading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <p className="font-medium">
                        {collectionStats[nft.address]?.totalVolume 
                          ? Number(collectionStats[nft.address].totalVolume).toLocaleString()
                          : 'N/A'} ETH
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
} 