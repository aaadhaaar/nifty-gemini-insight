
/**
 * Utility to detect technical analysis language in event-driven data objects.
 */
export function isTechnicalAnalysis(item: any): boolean {
  const textBlocks = [
    item?.what_happened || "",
    item?.why_matters || "",
    item?.market_impact_description || ""
  ];
  const technicalPatterns = [
    /breakout/i,
    /break\s+(above|below)/i,
    /support\s+level/i,
    /resistance\s+level/i,
    /resistance/i,
    /support/i,
    /alert[:]?/i,
    /bullish/i,
    /bearish/i,
    /call\/put/i,
    /stop[-\s]?loss/i,
    /rally/i,
    /pullback/i,
    /buy(?:ing)?\s+above/i,
    /selling?\s+below/i,
    /\btrend\b/i,
    /short[-\s]?term/i,
    /long[-\s]?positions?/i,
    /\btrigger/i,
    /\bsignal/i,
    /indicator/i,
    /crucial\s+(level|resistance|support)/i,
  ];
  return textBlocks.some(text =>
    technicalPatterns.some(pattern => pattern.test(text))
  );
}
