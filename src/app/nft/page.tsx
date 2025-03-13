"use client";

import { useQuery } from "@tanstack/react-query";
import { type Chain } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { CustomizedConnectButton } from "../../components/blocks/CustomConnectButton";
import { LoadingSpinner } from "../../components/blocks/Loading";
import { useState, useEffect } from "react";
import { InputsSection } from "../../components/blocks/InputsSection";
import { MarkdownRenderer } from "../../components/blocks/markdown-renderer";
import { ChevronLeft } from "lucide-react";
import { getNFTAnalysis } from "../server-actions/getNFTAnalysis";
import { NFTGrid } from "../../components/blocks/NFTGrid";
import { Card } from "@/components/ui/card";

// Define Ethereum chain for NFTs
const ethereumChain: Chain = {
  id: 1,
  name: "Ethereum",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: "https://ethereum.rpc.thirdweb.com"
} as const;

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
  type?: "buy" | "sell" | "hold";
  title?: string;
  description?: string;
  summary?: string;
  actions?: Action[];
  content?: string;
  nftInfo?: {
    address: string;
    name: string;
    symbol: string;
    floorPrice: string;
    totalVolume: string;
  };
  walletInfo?: {
    address: string;
    balance: string;
    holdings: string;
  };
};

type NFTAnalysis = {
  sections: Section[];
};

type Screen =
  | { id: "initial" }
  | {
      id: "response";
      props: {
        nftAddress: string;
        chain: Chain;
        walletAddress: string;
      };
    };

export default function NFTPage() {
  const [screen, setScreen] = useState<Screen>({ id: "initial" });
  const account = useActiveAccount();

  if (screen.id === "initial") {
    return (
      <NFTLandingScreen
        onSubmit={(values) => {
          setScreen({
            id: "response",
            props: {
              nftAddress: values.nftAddress,
              chain: ethereumChain,
              walletAddress: account?.address || "",
            },
          });
        }}
      />
    );
  }

  if (screen.id === "response") {
    return (
      <NFTResponseScreen
        {...screen.props}
        onBack={() => setScreen({ id: "initial" })}
      />
    );
  }

  return null;
}

function NFTLandingScreen({ onSubmit }: { onSubmit: (values: { nftAddress: string }) => void }) {
  const account = useActiveAccount();

  return (
    <main className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-6xl lg:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-t dark:bg-gradient-to-b from-foreground to-foreground/70 tracking-tight inline-flex gap-2 lg:gap-3 items-center">
          <span>NFT Analyzer</span>
        </h1>
        <p className="text-xl lg:text-2xl text-muted-foreground font-medium mb-8">
          ETHEREUM NFT COLLECTION ANALYZER
        </p>
        {!account && (
          <div className="w-full max-w-sm">
            <CustomizedConnectButton />
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Top NFT Collections</h2>
              <p className="text-muted-foreground mt-1">Highest 24h volume on Ethereum</p>
            </div>
            {account && (
              <p className="text-sm text-muted-foreground">
                Click collection to analyze it
              </p>
            )}
          </div>
        </div>
        
        {!account ? (
          <div className="rounded-xl border-2 border-dashed p-8 text-center">
            <p className="text-muted-foreground">Connect your wallet to analyze NFT collections</p>
          </div>
        ) : (
          <NFTGrid 
            onCollectionSelect={(address) => {
              onSubmit({ nftAddress: address });
            }} 
          />
        )}
      </div>
    </main>
  );
}

function NFTResponseScreen(props: {
  nftAddress: string;
  chain: Chain;
  walletAddress: string;
  onBack: () => void;
}) {
  const analysisQuery = useQuery({
    queryKey: [
      "nft-response",
      {
        nftAddress: props.nftAddress,
        chain: props.chain.id,
        walletAddress: props.walletAddress,
      },
    ],
    queryFn: async () => {
      try {
        const res = await getNFTAnalysis({
          chainId: props.chain.id,
          nftAddress: props.nftAddress,
          walletAddress: props.walletAddress,
        });

        if (!res.ok) {
          throw new Error(res.error || "Failed to analyze NFT collection");
        }

        return res.data as NFTAnalysis;
      } catch (error) {
        console.error("Query function error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred while analyzing the NFT collection");
      }
    },
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [loadingMessage, setLoadingMessage] = useState(
    "Initializing NFT collection analysis...",
  );

  useEffect(() => {
    const messages = [
      "Initializing NFT collection analysis... (1-2 minutes total)",
      "Gathering collection metadata... (1-2 minutes total)",
      "Analyzing floor price history... (1-2 minutes total)",
      "Evaluating trading volume... (1-2 minutes total)",
      "Checking holder distribution... (1-2 minutes total)",
      "Analyzing market sentiment... (1-2 minutes total)",
      "Processing rarity data... (1-2 minutes total)",
      "Evaluating listing patterns... (1-2 minutes total)",
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
    (s: Section) => s.section === "verdict",
  );
  const detailsSection = analysisQuery.data?.sections.find(
    (s: Section) => s.section === "details",
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
            address: props.nftAddress,
            priceUSD: verdictSection?.nftInfo?.floorPrice || "0.00",
            marketCapUSD: verdictSection?.nftInfo?.totalVolume || "0",
            volumeUSD: "0", // TODO: Add 24h volume
            chain: props.chain,
          }}
          walletInfo={{
            address: props.walletAddress || "0x0000000000000000000000000000000000000000",
            balanceUSD: verdictSection?.walletInfo?.balance || "0.00",
            chain: props.chain,
          }}
        />
      </div>

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
              : "An unexpected error occurred while analyzing the NFT collection"}
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
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      verdictSection.type === "buy" 
                        ? "bg-green-500/10 text-green-500" 
                        : verdictSection.type === "sell" 
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {verdictSection.type === "buy" 
                        ? "Bullish Signal" 
                        : verdictSection.type === "sell" 
                        ? "Bearish Signal"
                        : "Neutral Signal"}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{verdictSection.title}</h3>
                  <p className="text-muted-foreground">{verdictSection.description}</p>
                </div>
              </Card>
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
                        markdownText={detailsSection.content?.split('##').map((section: string, index: number) => {
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
                {verdictSection.actions.map((action: Action) => (
                  <Card 
                    key={action.label} 
                    className="p-6 hover:bg-muted/5 transition-colors"
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
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
} 