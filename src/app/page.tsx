"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomizedConnectButton } from "../components/blocks/CustomConnectButton";
import { isAddress, type Chain } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultSelectedChain, supportedChains } from "../lib/supportedChains";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../components/blocks/Loading";
import { useState } from "react";
import { getTokenAnalysis } from "./server-actions/getTokenAnalysis";
import { PlainTextCodeBlock } from "../components/blocks/code/plaintext-code";

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

  if (screen.id === "initial") {
    return (
      <LandingPageScreen
        onSubmit={(values) => {
          setScreen({
            id: "response",
            props: {
              tokenAddress: values.tokenAddress,
              chain:
                supportedChains.find((chain) => chain.id === values.chainId) ||
                defaultSelectedChain,
              walletAddress: "0x1234567890123456789012345678901234567890",
            },
          });
        }}
      />
    );
  }

  if (screen.id === "response") {
    return <ResponseScreen {...screen.props} />;
  }

  return null;
}

function LandingPageScreen(props: {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}) {
  return (
    <main className="grow flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <h1 className="text-6xl lg:text-8xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-t dark:bg-gradient-to-b from-foreground to-foreground/70 tracking-tight inline-flex gap-2 lg:gap-3 items-center">
          <span>Yeet</span>
          <span className="italic font-bold ml-1">or</span>
          <span>Jeet</span>
        </h1>
        <p className="text-xl lg: mb-16 text-muted-foreground font-medium">
          Instant Trading Decisions
        </p>

        <TokenForm
          onSubmit={(values) => {
            props.onSubmit(values);
          }}
        />
      </div>
    </main>
  );
}

function ResponseScreen(props: {
  tokenAddress: string;
  chain: Chain;
  walletAddress: string;
}) {
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
      const res = await getTokenAnalysis({
        chainId: props.chain.id,
        tokenAddress: props.tokenAddress,
        walletAddress: props.walletAddress,
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      return res.data;
    },
    retry: false,
  });

  if (analysisQuery.isError) {
    console.error(analysisQuery.error);
  }

  if (analysisQuery.data) {
    const dataStr = JSON.stringify(analysisQuery.data, null, 2);
    return (
      <div className="grow flex flex-col container max-w-6xl py-10">
        <PlainTextCodeBlock code={dataStr} />
      </div>
    );
  }

  return (
    <div className="grow flex flex-col container max-w-6xl py-10 items-center justify-center">
      {analysisQuery.isPending && <LoadingSpinner className="size-10" />}
      {analysisQuery.isError && (
        <p className="text-red-500">Failed to get response </p>
      )}
    </div>
  );
}

const formSchema = z.object({
  chainId: z.coerce.number().int().min(1, "Chain is required"),
  tokenAddress: z.z
    .string()
    .min(1, "Token address is required")
    .refine((v) => {
      // don't directly return isAddress(v) because it wil typecase tokenAddress to 0xString
      if (isAddress(v)) {
        return true;
      }

      return false;
    }, "Invalid token address"),
});

function TokenForm(props: {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}) {
  const account = useActiveAccount();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      chainId: defaultSelectedChain.id,
      tokenAddress: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    props.onSubmit(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-sm flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="chainId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full bg-card border-input text-foreground focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all">
                    <SelectValue placeholder="Select a chain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x123..."
                  {...field}
                  className="w-full bg-card border-input text-foreground placeholder-muted-foreground focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!account ? (
          <CustomizedConnectButton />
        ) : (
          <Button
            type="submit"
            variant="default"
            className="w-full font-semibold"
            disabled={!account}
          >
            Get Answer
          </Button>
        )}
      </form>
    </Form>
  );
}
