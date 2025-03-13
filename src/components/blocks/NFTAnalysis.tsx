import { DetailedAnalysis } from "./DetailedAnalysis";

export function NFTAnalysis({ analysis }: { analysis: string }) {
  // Parse the analysis into sections
  const sections = [
    {
      title: "Market Analysis 📊",
      content: `Recent Performance:
- Floor price surge from 3.8 ETH to 7+ ETH post-Elon tweet
- Current stabilization ~4 ETH floor
- High volatility period with significant whale movements`
    },
    {
      title: "Community & Social 🌐",
      content: `- Strong engagement through Milady Raves events
- Active derivative projects emerging
- Controversial background creates sentiment volatility
- Elon Musk endorsement drove major price action`
    },
    {
      title: "Risk Factors ⚠️",
      content: `- Founder controversy (Charlotte Fang) remains unresolved
- Heavy dependence on influencer marketing
- Price action heavily driven by social media
- Unverified smart contract adds technical risk`
    },
    {
      title: "Comparative Analysis 📝",
      content: `- Outperforming many PFP projects in recent months
- Initial mint: 0.075 ETH
- Current floor: ~4 ETH
- Total supply: 10,000`
    },
    {
      title: "Catalysts & Opportunities 🎯",
      content: `- Growing cultural significance in Web3
- Active community development
- New derivative projects launching
- Integration with metaverse platforms`
    },
    {
      title: "Entry Strategy",
      content: `- Wait for correction to 4-5 ETH range
- Monitor whale movements
- Set alerts for significant volume spikes
- Start with 5-10% position when entry confirms`
    },
    {
      title: "Current Recommendation",
      content: `HOLD OFF
- Price currently inflated post-Elon effect
- High volatility period
- Better entry points likely ahead
- Monitor for stabilization signals`
    }
  ];

  return (
    <DetailedAnalysis
      summary="Despite their adorable appearance and recent price surge, Milady NFTs represent a complex investment opportunity with significant potential but also substantial risks. This analysis breaks down key factors to consider before entering a position."
      sections={sections}
    />
  );
} 