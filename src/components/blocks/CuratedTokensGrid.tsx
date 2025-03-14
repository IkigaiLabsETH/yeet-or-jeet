import { useState } from 'react';
import { CURATED_TOKENS, type CuratedToken } from '@/lib/curatedTokens';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = ['All', 'DeFi', 'Gaming', 'Infrastructure', 'Meme', 'Ecosystem'] as const;

interface CuratedTokensGridProps {
  onTokenSelect: (address: string) => void;
}

export function CuratedTokensGrid({ onTokenSelect }: CuratedTokensGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');

  const filteredTokens = CURATED_TOKENS.filter(token => 
    selectedCategory === 'All' || token.category === selectedCategory
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
        {filteredTokens.map((token) => (
          <button
            key={token.address}
            onClick={() => onTokenSelect(token.address)}
            className="p-4 rounded-xl border bg-card hover:border-primary transition-all duration-200 text-left"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{token.name}</h3>
                  <p className="text-sm text-muted-foreground">{token.symbol}</p>
                </div>
                <Badge variant="secondary">{token.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {token.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 