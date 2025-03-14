"use client";

import { SourcesSection } from "@/components/blocks/SourcesSection";
import { InputsSection } from "../../components/blocks/InputsSection";
import { TokenInputSection } from "../../components/blocks/TokenInputSection";
import { Loading } from "../../components/blocks/Loading";
import { berachain } from "../../lib/supportedChains";
import { TradeSummarySection } from "../../components/blocks/TradeSummarySection/TradeSummarySection";
import { MarkdownRenderer } from "../../components/blocks/markdown-renderer";

const markdownExample = `\
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6


This a paragraph

This is another paragraph

This a very long paragraph lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec pur us. Donec euismod, nunc nec vehicula.
ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec pur us. Donec euismod, nunc nec vehicula.


## Empasis

*Italic text*
_Also italic text_

**Bold text**
__Also bold text__

***Bold and italic***
___Also bold and italic___

## Blockquote
> This is a blockquote.

## Lists

### Unordered list
- Item 1
- Item 2
  - Nested Item 1
  - Nested Item 2

### Ordered list
1. First item
2. Second item
   1. Sub-item 1
   2. Sub-item 2

### Mixed Nested lists

- Item 1
- Item 2
  1. Sub-item 1
  2. Sub-item 2


1. First item
2. Second item
   - Sub-item 1
   - Sub-item 2

### Code
This a a paragraph with some \`inlineCode()\`

This a \`const longerCodeSnippet = "Example. This should be able to handle line breaks as well, it should not be overflowing the page";\`

\`\`\`javascript
function example() {
  console.log("Hello, world!");
}
\`\`\`

### Links
[thirdweb](https://www.thirdweb.com)

### Images
![Alt text](https://picsum.photos/2000/500)


### Horizontal Rule


---


### Tables

| Column 1     | Column 2         | Column 3     | Column 4         | Column 5     |
|--------------|------------------|--------------|------------------|--------------|
| Row 1 Cell 1 | Row 1 Cell 2     | Row 1 Cell 3 | Row 1 Cell 4     | Row 1 Cell 5 |
| Row 2 Cell 1 | Row 2 Cell 2     | Row 2 Cell 3 | Row 2 Cell 4     | Row 2 Cell 5 |
| Row 3 Cell 1 | Row 3 Cell 2     | Row 3 Cell 3 | Row 3 Cell 4     | Row 3 Cell 5 |
| Row 4 Cell 1 | Row 4 Cell 2     | Row 4 Cell 3 | Row 4 Cell 4     | Row 4 Cell 5 |
| Row 5 Cell 1 | Row 5 Cell 2     | Row 5 Cell 3 | Row 5 Cell 4     | Row 5 Cell 5 |


### Escaping special characters
\\*This text is not italicized.\\*

### Strikethrough
~~This is strikethrough text.~~

### HTML Elements

<br />
`;

export default function StyleguidePage() {
  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-4xl font-semibold tracking-tight mb-10">
        Design System
      </h1>

      <div className="flex flex-col gap-10">
        <TokenInputSection address="0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf" />
        <Loading />
        <SourcesSection />
        <InputsSection
          tokenInfo={{
            address: "0x6969696969696969696969696969696969696969",
            priceUSD: "$32.23",
            marketCapUSD: "$62.23m",
            volumeUSD: "$523.3m",
            chain: berachain,
          }}
          walletInfo={{
            address: "0xAE91CB00C413A8D6089Ba0bc8bF66fbA47A912Ea",
            balanceUSD: "$32.2k",
            chain: berachain,
          }}
        />

        <InputsSection
          tokenInfo={{
            address: "0x6969696969696969696969696969696969696969",
            priceUSD: "$32.23",
            marketCapUSD: "$62.23m",
            volumeUSD: "$523.3m",
            chain: berachain,
          }}
          walletInfo={{
            address: "0xAE91CB00C413A8D6089Ba0bc8bF66fbA47A912Ea",
            balanceUSD: "$32.2k",
            chain: berachain,
          }}
        />

        <TradeSummarySection
          variant="sell"
          title="DCA OUT 20% of your VVV"
          description="Sell $500 at 24.32% profit"
          tokenAddress="0x6969696969696969696969696969696969696969"
          chainId={80094}
        />

        <TradeSummarySection
          variant="buy"
          title="DCA IN $3.2k into VVV"
          description="Buy ~$3.2k at $62.3m MC"
          tokenAddress="0x6969696969696969696969696969696969696969"
          chainId={80094}
        />

        <TradeSummarySection
          variant="hold"
          title="Hodl VVV"
          description="Don't change anything"
          tokenAddress="0x6969696969696969696969696969696969696969"
          chainId={80094}
        />

        <MarkdownRenderer markdownText={markdownExample} skipHtml={true} />
      </div>
    </div>
  );
}
