// Indonesia in Numbers — verified dataset.
// Every figure below was checked against its named source on 26 Nov 2026.
// Sources: World Bank WDI (SP.POP.TOTL, NY.GDP.MKTP.CD, NY.GDP.PCAP.CD,
// NY.GDP.MKTP.PP.CD, NY.GDP.MKTP.KD.ZG), BPS-Statistics Indonesia (Sakernas,
// poverty releases, HDI release, CPI), Destatis country profile (sector GVA,
// goods trade), EIU via Asian Exim Banks (goods trade). See Methodology page.
const DATA = {
  country: "Indonesia",
  updated: "26 November 2026",
  population: {
    // World Bank WDI, indicator SP.POP.TOTL, mid-year estimates.
    series: [
      [2015, 261799249], [2016, 264627418], [2017, 267346658],
      [2018, 269951846], [2019, 272489381], [2020, 274814866],
      [2021, 276758053], [2022, 278830529], [2023, 281190067],
      [2024, 283487931],
    ],
    latest: { year: 2024, value: 283487931 },
    // UN World Population Prospects / World Bank, 2024.
    medianAge: 31.1,
    ageStructure: [
      { group: "0–14 years", share: 24.6 },
      { group: "15–64 years", share: 68.1 },
      { group: "65+ years", share: 7.3 },
    ],
    // Provincial populations, 2024, millions (BPS-based compilations).
    provinces: [
      { name: "West Java", pop: 50.3 },
      { name: "East Java", pop: 41.8 },
      { name: "Central Java", pop: 37.9 },
      { name: "North Sumatra", pop: 15.6 },
      { name: "Banten", pop: 11.8 },
      { name: "Jakarta", pop: 11.1 },
      { name: "South Sulawesi", pop: 9.5 },
      { name: "Lampung", pop: 9.4 },
      { name: "South Sumatra", pop: 8.8 },
      { name: "Riau", pop: 6.7 },
    ],
    provincesCount: 38,
  },
  economy: {
    // World Bank WDI, current US$.
    gdpUsdBn: 1396.3,
    gdpPerCapitaUsd: 4925,
    gdpPppUsdTn: 4.67,
    gdpPppPerCapitaUsd: 16472,
    gdpRank: 16,
    // World Bank WDI, annual % growth of GDP (NY.GDP.MKTP.KD.ZG).
    growth: [
      [2015, 4.9], [2016, 5.0], [2017, 5.1], [2018, 5.2], [2019, 5.0],
      [2020, -2.1], [2021, 3.7], [2022, 5.3], [2023, 5.0], [2024, 5.03],
    ],
    // Gross value added shares, 2024 (Destatis / World Bank).
    gva: [
      { sector: "Services", share: 43.8 },
      { sector: "Industry", share: 39.3 },
      { sector: "Agriculture, forestry & fishing", share: 12.6 },
    ],
    // Largest industries, share of nominal GDP 2024 (BPS via BCA).
    industries: [
      { sector: "Manufacturing", share: 19.0 },
      { sector: "Wholesale & retail trade", share: 13.1 },
      { sector: "Agriculture, forestry & fishing", share: 12.6 },
      { sector: "Construction", share: 10.1 },
      { sector: "Mining & quarrying", share: 9.2 },
      { sector: "Transport & warehousing", share: 6.1 },
      { sector: "Information & communication", share: 4.3 },
      { sector: "Financial services & insurance", share: 4.2 },
      { sector: "Government administration & defence", share: 3.0 },
      { sector: "Education", share: 2.8 },
    ],
    // GDP by expenditure, share of nominal GDP 2024 (BPS).
    expenditure: [
      { item: "Household consumption", share: 54.0 },
      { item: "Fixed-asset investment", share: 29.1 },
      { item: "Exports of goods & services", share: 22.3 },
      { item: "Government consumption", share: 7.7 },
      { item: "Non-profit institutions", share: 1.4 },
      { item: "Imports of goods & services", share: -20.5 },
    ],
    // Goods trade, 2024 (EIU via Asian Exim Banks profile).
    trade: {
      exportsUsdBn: 264.7, importsUsdBn: 233.7, surplusUsdBn: 31.0,
      topExports: [
        { item: "Mineral fuels & oils", share: 21.0 },
        { item: "Animal & vegetable fats and oils", share: 10.1 },
        { item: "Iron & steel", share: 9.7 },
        { item: "Electrical machinery & equipment", share: 5.7 },
        { item: "Vehicles (non-railway)", share: 4.2 },
      ],
      topImportSources: [
        { country: "China", share: 31.1 },
        { country: "Singapore", share: 9.2 },
        { country: "Japan", share: 6.4 },
        { country: "United States", share: 5.1 },
      ],
    },
  },
  prices: {
    // CPI inflation, year-on-year in December (BPS).
    inflationDec: [
      [2021, 1.87], [2022, 5.51], [2023, 2.61], [2024, 1.57],
    ],
    inflationAvg2024: 2.3,
  },
  labour: {
    // BPS National Labour Force Survey (Sakernas), February 2025.
    unemploymentFeb2025: 4.76,
    unemploymentFeb2024: 4.82,
    labourForceM: 153.05,
    employedM: 145.77,
    unemployedM: 7.28,
    informalM: 86.58,
    informalShare: 59.4,
    formalM: 59.19,
  },
  poverty: {
    // BPS, September each year, % of population.
    series: [
      [2018, 9.66], [2019, 9.22], [2020, 10.19], [2021, 9.71],
      [2022, 9.57], [2023, 9.36], [2024, 8.57],
    ],
    latest: { period: "September 2024", rate: 8.57, peopleM: 24.06 },
    povertyLineRp: 595242,
    mar2025: 8.47,
    sep2025: 8.25,
  },
  society: {
    // BPS Human Development Index release, 15 Nov 2024.
    hdi2024: 75.02,
    hdi2023: 74.39,
    lifeExpectancy: 74.15,
    expectedSchooling: 13.21,
  },
  geography: {
    provinces: 38,
    landAreaKm2: 1904443,
    capital: "Jakarta",
    currency: "Rupiah (IDR)",
  },
};
