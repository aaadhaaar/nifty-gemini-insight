
export class SearchQueries {
  // Ultra-focused Indian market queries for comprehensive intelligence
  static getIndianMarketQueries(): string[] {
    return [
      'Indian stock market Nifty Sensex today news RBI policy earnings results FII DII flows live updates',
      'India market gainers losers top performers BSE NSE corporate earnings quarterly results guidance',
      'Indian rupee USD forex crude oil gold commodity prices inflation market impact volatility',
      'India IPO listings corporate announcements merger acquisition SEBI regulatory policy changes',
      'Nifty Bank index banking sector HDFC ICICI SBI earnings results policy impact analysis',
      'Indian IT sector TCS Infosys Wipro earnings results global cues technology stocks'
    ]
  }

  static getPreMarketQueries(): string[] {
    return [
      'Indian market pre-market global cues overnight US Asia markets SGX Nifty opening predictions',
      'India pre-market trading corporate results earnings preview FII DII activity futures',
      'Pre-market analysis Nifty Sensex opening levels support resistance technical analysis'
    ]
  }

  static getPostMarketQueries(): string[] {
    return [
      'Indian stock market closing analysis Nifty Sensex performance summary trading session',
      'Market closing bells earnings results post market analysis sectoral performance review',
      'End of day market wrap Indian stocks BSE NSE closing levels volume analysis'
    ]
  }

  static getSectorSpecificQueries(): string[] {
    return [
      'Indian banking sector analysis HDFC ICICI SBI Axis Bank earnings results RBI policy',
      'India IT sector analysis TCS Infosys Wipro HCL Tech earnings results global outlook',
      'Indian pharma sector analysis Sun Pharma Dr Reddy Cipla earnings results regulatory updates',
      'Indian auto sector analysis Maruti Tata Motors Bajaj Auto earnings results EV trends'
    ]
  }
}
