import { useState } from 'react';
import { CURATED_NFTS } from '@/lib/curatedNFTs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const CATEGORIES = ['All', 'Gen Art', 'AI', 'Icons', 'Photography'] as const;

interface CuratedNFTsGridProps {
  onCollectionSelect: (address: string) => void;
}

export function CuratedNFTsGrid({ onCollectionSelect }: CuratedNFTsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');

  const filteredCollections = CURATED_NFTS.filter(nft => 
    selectedCategory === 'All' || nft.category === selectedCategory
  );

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
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {nft.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Floor Price</p>
                    <p className="font-medium">{nft.floorPrice} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Total Volume</p>
                    <p className="font-medium">{Number(nft.totalVolume).toLocaleString()} ETH</p>
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