export const CAR_MODELS = [
  // Maruti Suzuki
  {
    name: "Alto",
    brand: { name: "Maruti Suzuki", parentCompany: "Suzuki Motor Corporation" },
    variants: ["800 Std", "LXi", "VXi"],
    fuelTypes: ["Petrol", "CNG"],
    transmissions: ["Manual"],
    generations: [
      { from: "2000", to: "2012" },
      { from: "2012", to: "2020" },
    ],
  },
  {
    name: "Swift",
    brand: { name: "Maruti Suzuki", parentCompany: "Suzuki Motor Corporation" },
    variants: ["LXi", "VXi", "ZXi", "ZXi+"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "AMT"],
    generations: [
      { from: "2005", to: "2011" },
      { from: "2011", to: "2018" },
      { from: "2018", to: "2025" },
    ],
  },
  {
    name: "Baleno",
    brand: { name: "Maruti Suzuki", parentCompany: "Suzuki Motor Corporation" },
    variants: ["Sigma", "Delta", "Zeta", "Alpha"],
    fuelTypes: ["Petrol"],
    transmissions: ["Manual", "AMT", "CVT"],
    generations: [
      { from: "2015", to: "2022" },
      { from: "2022", to: "2025" },
    ],
  },

  // Hyundai
  {
    name: "Creta",
    brand: { name: "Hyundai", parentCompany: "Hyundai Motor Company" },
    variants: ["E", "S", "SX", "SX(O)"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "IVT", "DCT"],
    generations: [
      { from: "2015", to: "2020" },
      { from: "2020", to: "2025" },
    ],
  },

  // Tata
  {
    name: "Nexon",
    brand: { name: "Tata Motors", parentCompany: "Tata Group" },
    variants: ["XE", "XM", "XZ", "XZ+"],
    fuelTypes: ["Petrol", "Diesel", "EV"],
    transmissions: ["Manual", "AMT", "Automatic"],
    generations: [
      { from: "2017", to: "2020"},
      { from: "2020", to: "2025" },
    ],
  },

  // Mahindra
  {
    name: "Scorpio",
    brand: { name: "Mahindra", parentCompany: "Mahindra & Mahindra Ltd." },
    variants: ["S3", "S5", "S7", "S11"],
    fuelTypes: ["Diesel"],
    transmissions: ["Manual"],
    generations: [
      { from: "2002", to: "2014" },
      { from: "2014", to: "2022"},
    ],
  },

  // Kia
  {
    name: "Seltos",
    brand: { name: "Kia", parentCompany: "Hyundai Motor Company" },
    variants: ["HTE", "HTK", "HTX", "GTX"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "IVT", "DCT"],
    generations: [
      { from: "2019", to: "2025" },
    ],
  },

  // Toyota
  {
    name: "Fortuner",
    brand: { name: "Toyota", parentCompany: "Toyota Motor Corporation" },
    variants: ["2.7 4x2 MT", "Legender", "4x4 AT"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "Automatic"],
    generations: [
      { from: "2009", to: "2016" },
      { from: "2016", to: "2021" },
      { from: "2021", to: "2025"},
    ],
  },

  // Honda
  {
    name: "City",
    brand: { name: "Honda", parentCompany: "Honda Motor Co., Ltd." },
    variants: ["SV", "V", "VX", "ZX"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "CVT"],
    generations: [
      { from: "1998", to: "2008" },
      { from: "2008", to: "2014"},
      { from: "2014", to: "2020" },
      { from: "2020", to: "2025"},
    ],
  },

  // Volkswagen
  {
    name: "Polo",
    brand: { name: "Volkswagen", parentCompany: "Volkswagen Group" },
    variants: ["Trendline", "Comfortline", "Highline", "GT TSI"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "Automatic", "DSG"],
    generations: [
      { from: "2010", to: "2022"},
    ],
  },

  // MG
  {
    name: "Hector",
    brand: { name: "MG Motor", parentCompany: "SAIC Motor" },
    variants: ["Style", "Super", "Smart", "Sharp"],
    fuelTypes: ["Petrol", "Diesel", "Hybrid"],
    transmissions: ["Manual", "CVT", "DCT"],
    generations: [
      { from: "2019", to: "2021" },
    ],
  },

  // Renault
  {
    name: "Kwid",
    brand: { name: "Renault", parentCompany: "Renault Group" },
    variants: ["RXL", "RXT", "Climber"],
    fuelTypes: ["Petrol"],
    transmissions: ["Manual", "AMT"],
    generations: [
      { from: "2015", to: "2022" },
    ],
  },

  // Nissan
  {
    name: "Magnite",
    brand: { name: "Nissan", parentCompany: "Nissan Motor Co. Ltd." },
    variants: ["XE", "XL", "XV", "XV Premium"],
    fuelTypes: ["Petrol"],
    transmissions: ["Manual", "CVT"],
    generations: [
      { from: "2020", to: "2025" },
    ],
  },

  // Jeep
  {
    name: "Compass",
    brand: { name: "Jeep", parentCompany: "Stellantis" },
    variants: ["Sport", "Longitude", "Limited", "Model S"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "DCT", "Automatic"],
    generations: [
      { from: "2017", to: "2025" },
    ],
  },
];
