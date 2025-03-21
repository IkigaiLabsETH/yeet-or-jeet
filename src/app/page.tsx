"use client";

import { useQuery } from "@tanstack/react-query";
import { getTokenAnalysis } from "./server-actions/getTokenAnalysis";
import { type Chain } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { CustomizedConnectButton } from "../components/blocks/CustomConnectButton";
import { defaultSelectedChain, supportedChains } from "../lib/supportedChains";
import { LoadingSpinner } from "../components/blocks/Loading";
import { useState, useEffect } from "react";
import { InputsSection } from "../components/blocks/InputsSection";
import { TradeSummarySection } from "../components/blocks/TradeSummarySection/TradeSummarySection";
import { MarkdownRenderer } from "../components/blocks/markdown-renderer";
import { ChevronLeft } from "lucide-react";
import { TopTokensGrid } from "../components/blocks/TopTokensGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CuratedTokensGrid } from "../components/blocks/CuratedTokensGrid";
import { gatherStartingData, type StartingData } from "../lib/helpers/info";

type NebulaTxData = {
  chainId: number;
  data: `0x${string}`;
  to: string;
  value: string;
};

type Action = {
  label: string;
  description: string;
  subtext: string;
  recommendedPercentage: number;
  txData: NebulaTxData;
};

type Section = {
  section: "inputs" | "verdict" | "details";
  type: "buy" | "sell" | "hold";
  title: string;
  description: string;
  summary?: string;
  actions?: Action[];
  content?: string;
  tokenInfo?: {
    address: string;
    name: string;
    symbol: string;
    price: string;
    marketCap: string;
    volume: string;
    imageUrl?: string;
  };
  walletInfo?: {
    address: string;
    balance: string;
    holdings: string;
  };
};

type TokenAnalysis = {
  sections: Section[];
};

type Screen =
  | { id: "initial" }
  | {
      id: "response";
      props: {
        tokenAddress: string;
        chain: Chain;
        walletAddress: string;
      };
    };

export default function LandingPage() {
  const [screen, setScreen] = useState<Screen>({ id: "initial" });
  const account = useActiveAccount();

  if (screen.id === "initial") {
    return (
      <LandingPageScreen
        onSubmit={(values) => {
          setScreen({
            id: "response",
            props: {
              tokenAddress: values.tokenAddress,
              chain: supportedChains.find((chain) => chain.id === 80094) || defaultSelectedChain,
              walletAddress: account?.address || "",
            },
          });
        }}
      />
    );
  }

  if (screen.id === "response") {
    return (
      <ResponseScreen
        {...screen.props}
        onBack={() => setScreen({ id: "initial" })}
      />
    );
  }

  return null;
}

function LandingPageScreen(props: {
  onSubmit: (values: { tokenAddress: string }) => void;
}) {
  const account = useActiveAccount();

  return (
    <main className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-6xl lg:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-t dark:bg-gradient-to-b from-foreground to-foreground/70 tracking-tight inline-flex gap-2 lg:gap-3 items-center">
          <span>the b/era</span>
        </h1>
        <p className="text-xl lg:text-2xl text-muted-foreground font-medium mb-8">
          BERACHAIN TOKEN ANALYZER
        </p>
        {!account && (
          <div className="w-full max-w-sm">
            <CustomizedConnectButton />
          </div>
        )}
      </div>

      <div className="space-y-8">
        {!account ? (
          <div className="rounded-xl border-2 border-dashed p-8 text-center">
            <p className="text-muted-foreground">Connect your wallet to analyze tokens</p>
          </div>
        ) : (
          <Tabs defaultValue="top" className="space-y-8">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="top">Top Tokens</TabsTrigger>
                <TabsTrigger value="curated">Curated List</TabsTrigger>
              </TabsList>
              <p className="text-sm text-muted-foreground">
                Click token to analyze it
              </p>
            </div>

            <TabsContent value="top" className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Top Trading Tokens</h2>
                <p className="text-muted-foreground mt-1">Highest 24h volume on Berachain</p>
              </div>
              <TopTokensGrid 
                onTokenSelect={(address) => {
                  props.onSubmit({ tokenAddress: address });
                }} 
              />
            </TabsContent>

            <TabsContent value="curated" className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Curated Token List</h2>
                <p className="text-muted-foreground mt-1">Hand-picked tokens on Berachain</p>
              </div>
              <CuratedTokensGrid 
                onTokenSelect={(address) => {
                  props.onSubmit({ tokenAddress: address });
                }}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}

function ResponseScreen(props: {
  tokenAddress: string;
  chain: Chain;
  walletAddress: string;
  onBack: () => void;
}) {
  const [info, setInfo] = useState<StartingData | undefined>();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await gatherStartingData(
          props.chain.id,
          props.tokenAddress,
          props.walletAddress,
        );
        setInfo(data);
      } catch (error) {
        console.error("Error fetching token info:", error);
      }
    };
    fetchInfo();
  }, [props.chain.id, props.tokenAddress, props.walletAddress]);

  const analysisQuery = useQuery({
    queryKey: [
      "response",
      {
        tokenAddress: props.tokenAddress,
        chain: props.chain.id,
        walletAddress: props.walletAddress,
      },
    ],
    queryFn: async () => {
      try {
        const res = await getTokenAnalysis({
          chainId: props.chain.id,
          tokenAddress: props.tokenAddress,
          walletAddress: props.walletAddress,
        });

        if (!res.ok) {
          console.error("Server returned error:", res.error);
          throw new Error(res.error || "Failed to analyze token");
        }

        if (!res.data || !res.data.sections) {
          console.error("Invalid response format:", res.data);
          throw new Error("Invalid response format from server");
        }

        return res.data as TokenAnalysis;
      } catch (error) {
        console.error("Query function error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred while analyzing the token");
      }
    },
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [loadingMessage, setLoadingMessage] = useState(
    "Initializing token analysis...",
  );

  useEffect(() => {
    const messages = [
      "Initializing token analysis... (1-2 minutes total)",
      "Formatting specialized AI queries... (1-2 minutes total)",
      "Establishing secure Nebula session... (1-2 minutes total)",
      "Gathering on-chain token data... (1-2 minutes total)",
      "Analyzing blockchain metrics and wallet interactions... (1-2 minutes total)",
      "Querying market sentiment and community insights... (1-2 minutes total)",
      "Processing token history and trading patterns... (1-2 minutes total)",
      "Evaluating smart contract interactions... (1-2 minutes total)",
      "Synthesizing AI responses... (1-2 minutes total)",
      "Preparing comprehensive analysis... (1-2 minutes total)",
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const verdictSection = analysisQuery.data?.sections.find(
    (s) => s.section === "verdict",
  );
  const detailsSection = analysisQuery.data?.sections.find(
    (s) => s.section === "details",
  );

  return (
    <main className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      <Button
        onClick={props.onBack}
        variant="ghost"
        className="gap-2 -translate-x-3 pl-2 pr-4 text-muted-foreground hover:text-foreground"
        size="sm"
      >
        <ChevronLeft className="size-4" />
        Back
      </Button>

      <div className="animate-in fade-in slide-in-from-bottom-4">
        <InputsSection
          tokenInfo={{
            address: props.tokenAddress,
            priceUSD: verdictSection?.tokenInfo?.price || 
              (info?.geckoTerminalData?.data?.attributes?.price_usd || 
               info?.dexScreenerData?.price_usd || 
               "0.00"),
            marketCapUSD: verdictSection?.tokenInfo?.marketCap || 
              (() => {
                // First try CoinGecko data for WBERA
                if (info?.coinGeckoData?.market_data?.market_cap?.usd) {
                  console.log("Using CoinGecko market cap:", info.coinGeckoData.market_data.market_cap.usd);
                  return info.coinGeckoData.market_data.market_cap.usd.toString();
                }

                // Then try GeckoTerminal
                const geckoMarketCap = info?.geckoTerminalData?.data?.attributes?.market_cap_usd;
                if (geckoMarketCap && !isNaN(parseFloat(geckoMarketCap)) && parseFloat(geckoMarketCap) > 0) {
                  console.log("Using GeckoTerminal market cap:", geckoMarketCap);
                  return geckoMarketCap;
                }

                // If not available, try to calculate it from total supply and price
                const totalSupply = info?.geckoTerminalData?.data?.attributes?.total_supply;
                const priceUSD = info?.geckoTerminalData?.data?.attributes?.price_usd;
                const decimals = info?.geckoTerminalData?.data?.attributes?.decimals;

                if (totalSupply && priceUSD && decimals !== undefined) {
                  console.log("Calculating market cap from:", {
                    totalSupply,
                    priceUSD,
                    decimals
                  });

                  try {
                    // Convert total supply to actual number considering decimals
                    const actualSupply = parseFloat(totalSupply) / Math.pow(10, decimals);
                    const price = parseFloat(priceUSD);
                    
                    if (!isNaN(actualSupply) && !isNaN(price)) {
                      const calculatedMarketCap = (actualSupply * price).toString();
                      console.log("Calculated market cap:", calculatedMarketCap);
                      return calculatedMarketCap;
                    }
                  } catch (error) {
                    console.error("Error calculating market cap:", error);
                  }
                }

                // Try DexScreener as fallback
                const dexScreenerMarketCap = info?.dexScreenerData?.market_cap_usd?.toString();
                if (dexScreenerMarketCap && !isNaN(parseFloat(dexScreenerMarketCap)) && parseFloat(dexScreenerMarketCap) > 0) {
                  console.log("Using DexScreener market cap:", dexScreenerMarketCap);
                  return dexScreenerMarketCap;
                }

                console.log("No valid market cap found, defaulting to 0");
                return "0";
              })(),
            volumeUSD: verdictSection?.tokenInfo?.volume || 
              (() => {
                // First try CoinGecko data for WBERA
                if (info?.coinGeckoData?.market_data?.total_volume?.usd) {
                  console.log("Using CoinGecko volume:", info.coinGeckoData.market_data.total_volume.usd);
                  return info.coinGeckoData.market_data.total_volume.usd.toString();
                }

                // Then try GeckoTerminal
                const geckoVolume = info?.geckoTerminalData?.data?.attributes?.volume_usd?.h24;
                if (geckoVolume) {
                  console.log("Using GeckoTerminal volume:", geckoVolume);
                  return geckoVolume;
                }

                // Finally try DexScreener
                const dexScreenerVolume = info?.dexScreenerData?.volume_24h?.toString();
                if (dexScreenerVolume) {
                  console.log("Using DexScreener volume:", dexScreenerVolume);
                  return dexScreenerVolume;
                }

                return "0";
              })(),
            chain: props.chain,
          }}
          walletInfo={{
            address: props.walletAddress || "0x0000000000000000000000000000000000000000",
            balanceUSD: verdictSection?.walletInfo?.balance || "0.00",
            chain: props.chain,
          }}
        />
      </div>

      {/* Sources section removed as per requirements */}
      {/* <div className="animate-in fade-in slide-in-from-bottom-4">
        <SourcesSection />
      </div> */}

      {analysisQuery.isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoadingSpinner className="size-4" />
          <span>{loadingMessage}</span>
        </div>
      )}

      {analysisQuery.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <h3 className="font-semibold mb-2">Error Loading Analysis</h3>
          <p className="text-sm">
            {analysisQuery.error instanceof Error
              ? analysisQuery.error.message
              : "An unexpected error occurred while analyzing the token"}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => analysisQuery.refetch()}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
            <Button
              onClick={props.onBack}
              variant="outline"
              size="sm"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}

      {analysisQuery.isSuccess && (
        <>
          {verdictSection && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <TradeSummarySection
                variant={verdictSection.type}
                title={verdictSection.title}
                description={verdictSection.description}
                tokenAddress={props.tokenAddress}
                chainId={props.chain.id}
              />
            </div>
          )}

          {detailsSection && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">Detailed Analysis</h3>
                <div className="w-full">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="space-y-8">
                      <MarkdownRenderer 
                        markdownText={detailsSection.content?.split('##').map((section, index) => {
                          if (index === 0) return section.trim();
                          return `\n\n## ${section.trim()}`;
                        }).join('\n\n') || ""} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {verdictSection?.actions && verdictSection.actions.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-semibold tracking-tight">Recommended Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {verdictSection.actions.map((action) => (
                  <div 
                    key={action.label} 
                    className="p-6 rounded-xl border bg-card hover:border-active-border transition-all duration-200 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{action.label}</h4>
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {action.recommendedPercentage}% Recommended
                        </div>
                      </div>
                      <p className="text-muted-foreground">{action.description}</p>
                      {action.subtext && (
                        <p className="text-sm text-muted-foreground italic">{action.subtext}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
