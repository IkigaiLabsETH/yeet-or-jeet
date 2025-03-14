import { useState, useMemo } from 'react';
import { CURATED_TOKENS } from '@/lib/curatedTokens';
import { Button } from '@/components/ui/button';
import { TokenIcon, TokenProvider } from "thirdweb/react";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { supportedChains } from "@/lib/supportedChains";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CopyIcon, 
  CheckIcon,
  TwitterIcon,
  GlobeIcon,
  MessageCircleIcon,
  DropletIcon,
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";

const CATEGORIES = ['All', 'DeFi', 'Gaming', 'Infrastructure', 'Meme', 'Ecosystem'] as const;
const berachain = supportedChains.find((chain) => chain.id === 80094)!;
const TOKENS_PER_PAGE = 12;

interface CuratedTokensGridProps {
  onTokenSelect: (address: string) => void;
}

export function CuratedTokensGrid({ onTokenSelect }: CuratedTokensGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize filtered tokens to prevent unnecessary recalculations
  const filteredTokens = useMemo(() => {
    return CURATED_TOKENS.filter(token => {
      // First check category
      const matchesCategory = selectedCategory === 'All' || token.category === selectedCategory;
      if (!matchesCategory) return false;
      
      // Then check search query if needed
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return token.name.toLowerCase().includes(query) || 
             token.symbol.toLowerCase().includes(query) ||
             token.address.toLowerCase().includes(query);
    });
  }, [selectedCategory, searchQuery]); // Only recalculate when these values change

  // Memoize pagination calculations
  const {
    totalPages,
    currentTokens,
    startIndex,
    endIndex
  } = useMemo(() => {
    const totalPages = Math.ceil(filteredTokens.length / TOKENS_PER_PAGE);
    const startIndex = (currentPage - 1) * TOKENS_PER_PAGE;
    const endIndex = startIndex + TOKENS_PER_PAGE;
    const currentTokens = filteredTokens.slice(startIndex, endIndex);
    
    return {
      totalPages,
      currentTokens,
      startIndex,
      endIndex
    };
  }, [filteredTokens, currentPage]);

  const handleCopy = async (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleSocialLink = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleImageError = (address: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(address);
      return newSet;
    });
  };

  // Reset to first page when changing filters
  const handleCategoryChange = (category: typeof CATEGORIES[number]) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (!filteredTokens.length) {
    return (
      <div className="space-y-4">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, symbol, or address..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <div className="text-muted-foreground p-8 border border-border bg-card/50 rounded-xl flex flex-col items-center justify-center text-center">
          <AlertCircleIcon className="size-12 mb-4 opacity-60" />
          <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
          <p className="mb-4">
            {searchQuery 
              ? `No tokens match your search "${searchQuery}"`
              : `No tokens found in the ${selectedCategory} category.`}
          </p>
          <div className="flex gap-2">
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
            {selectedCategory !== 'All' && (
              <Button 
                variant="outline" 
                onClick={() => handleCategoryChange('All')}
              >
                Show All Categories
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, symbol, or address..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTokens.map((token) => (
          <TokenProvider
            key={token.address}
            address={token.address}
            client={thirdwebClient}
            chain={berachain}
          >
            <div className="relative group">
              <button
                onClick={() => onTokenSelect(token.address)}
                className="w-full text-left bg-card border rounded-xl p-6 hover:border-active-border transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  {/* Token Image with Enhanced Fallback */}
                  {token.image_url && !failedImages.has(token.address) ? (
                    <div className="relative size-12 rounded-full overflow-hidden ring-2 ring-background">
                      <Image 
                        src={token.image_url} 
                        alt={token.name} 
                        fill 
                        className="object-cover"
                        onError={() => handleImageError(token.address)}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <TokenIcon
                      className="size-12 rounded-full ring-2 ring-background"
                      fallbackComponent={
                        <div className="size-12 rounded-full from-blue-800 to-blue-500 bg-gradient-to-br ring-2 ring-background flex items-center justify-center text-white font-bold">
                          {token.symbol?.slice(0, 2).toUpperCase() || "??"}
                        </div>
                      }
                      loadingComponent={<Skeleton className="size-12 rounded-full" />}
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {/* Token Name and Price */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold truncate">{token.name}</h3>
                      <span className="font-medium">
                        ${Number(token.price_usd).toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: Number(token.price_usd) < 0.01 ? 8 : 6 
                        })}
                      </span>
                    </div>
                    
                    {/* Symbol and Price Change */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">{token.symbol}</span>
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        (token.price_change_24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {(token.price_change_24h || 0) >= 0 ? (
                          <ArrowUpIcon className="size-3" />
                        ) : (
                          <ArrowDownIcon className="size-3" />
                        )}
                        {Math.abs(token.price_change_24h || 0).toFixed(2)}%
                      </div>
                    </div>
                    
                    {/* Volume and Market Cap */}
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>Vol: ${Math.round(token.volume_24h || 0).toLocaleString()}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>24h Trading Volume</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>MC: ${Math.round(token.market_cap_usd || 0).toLocaleString()}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Market Cap</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Liquidity */}
                    {token.liquidity_usd && (
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <DropletIcon className="size-3 mr-1" />
                                <span>Liq: ${Math.round(token.liquidity_usd).toLocaleString()}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Total Liquidity</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    {/* Social Links and Trust Score */}
                    {(token.twitter_handle || token.websites?.length || token.telegram_handle || token.trust_score !== undefined) && (
                      <div className="flex items-center mt-3 pt-2 border-t border-border">
                        <div className="flex gap-2 flex-1">
                          {token.twitter_handle && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="size-7 rounded-full" 
                                    onClick={(e) => handleSocialLink(e, `https://twitter.com/${token.twitter_handle}`)}
                                  >
                                    <TwitterIcon className="size-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>@{token.twitter_handle}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {token.websites && token.websites.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="size-7 rounded-full" 
                                    onClick={(e) => handleSocialLink(e, token.websites?.[0])}
                                  >
                                    <GlobeIcon className="size-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{token.websites[0] && new URL(token.websites[0]).hostname}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {token.telegram_handle && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="size-7 rounded-full" 
                                    onClick={(e) => handleSocialLink(e, `https://t.me/${token.telegram_handle}`)}
                                  >
                                    <MessageCircleIcon className="size-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Telegram</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        
                        {/* Trust Score with Enhanced Styling */}
                        {token.trust_score !== undefined && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  "text-xs px-2 py-0.5 rounded-full font-medium",
                                  token.trust_score >= 70 ? "bg-green-100 text-green-800" :
                                  token.trust_score >= 40 ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                )}>
                                  Trust: {token.trust_score}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {token.trust_score >= 70 ? "High Trust Score" :
                                   token.trust_score >= 40 ? "Medium Trust Score" :
                                   "Low Trust Score"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Token Description */}
                {token.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-3 text-xs text-muted-foreground line-clamp-2 cursor-help">
                          {token.description}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{token.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </button>
              
              {/* Copy Address Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleCopy(token.address, e)}
              >
                {copiedAddress === token.address ? (
                  <CheckIcon className="size-4 text-green-500" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          </TokenProvider>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredTokens.length)} of {filteredTokens.length} tokens
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 