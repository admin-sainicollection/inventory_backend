export const CAR_MODELS = [
  // Maruti Suzuki
  {
    name: "Alto",
    brand: "Maruti Suzuki",
    variants: ["800 Std", "LXi", "VXi"],
    fuelType: ["Petrol", "CNG"],
    year: [
      { from: 2000, to: 2012 },
      { from: 2012, to: 2020 },
    ],
    transmission: ["Manual"],
  },
  {
    name: "Alto K10",
    brand: "Maruti Suzuki",
    variants: ["LXi", "VXi", "VXi+ AMT"],
    fuelType: ["Petrol", "CNG"],
    year: [
      { from: 2010, to: 2014 },
      { from: 2014, to: 2023 },
    ],
    transmission: ["Manual", "AMT"],
  },
  {
    name: "Wagon R",
    brand: "Maruti Suzuki",
    variants: ["LXi", "VXi", "ZXi"],
    fuelType: ["Petrol", "CNG"],
    year: [
      { from: 2000, to: 2010 },
      { from: 2010, to: 2019 },
      { from: 2019, to: 2025 },
    ],
    transmission: ["Manual", "AMT"],
  },
  {
    name: "Swift",
    brand: "Maruti Suzuki",
    variants: ["LXi", "VXi", "ZXi", "ZXi+"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2005, to: 2011 },
      { from: 2011, to: 2018 },
      { from: 2018, to: 2025 },
    ],
    transmission: ["Manual", "AMT"],
  },
  {
    name: "Baleno",
    brand: "Maruti Suzuki",
    variants: ["Sigma", "Delta", "Zeta", "Alpha"],
    fuelType: ["Petrol"],
    year: [
      { from: 2015, to: 2022 },
      { from: 2022, to: 2025 },
    ],
    transmission: ["Manual", "AMT", "CVT"],
  },

  // Hyundai
  {
    name: "i20",
    brand: "Hyundai",
    variants: ["Magna", "Sportz", "Asta"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2008, to: 2014 },
      { from: 2014, to: 2020 },
      { from: 2020, to: 2025 },
    ],
    transmission: ["Manual", "CVT", "iMT"],
  },
  {
    name: "Creta",
    brand: "Hyundai",
    variants: ["E", "S", "SX", "SX(O)"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2015, to: 2020 },
      { from: 2020, to: 2025 },
    ],
    transmission: ["Manual", "IVT", "DCT"],
  },

  // Tata
  {
    name: "Nexon",
    brand: "Tata",
    variants: ["XE", "XM", "XZ", "XZ+"],
    fuelType: ["Petrol", "Diesel", "EV"],
    year: [
      { from: 2017, to: 2020 },
      { from: 2020, to: 2025 },
    ],
    transmission: ["Manual", "AMT", "Automatic"],
  },

  // Mahindra
  {
    name: "Scorpio",
    brand: "Mahindra",
    variants: ["S3", "S5", "S7", "S11"],
    fuelType: ["Diesel"],
    year: [
      { from: 2002, to: 2014 },
      { from: 2014, to: 2022 },
    ],
    transmission: ["Manual"],
  },
  {
    name: "XUV700",
    brand: "Mahindra",
    variants: ["MX", "AX3", "AX5", "AX7"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2021, to: 2025 },
    ],
    transmission: ["Manual", "Automatic"],
  },

  // Kia
  {
    name: "Seltos",
    brand: "Kia",
    variants: ["HTE", "HTK", "HTX", "GTX"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2019, to: 2025 },
    ],
    transmission: ["Manual", "IVT", "DCT"],
  },

  // Toyota
  {
    name: "Fortuner",
    brand: "Toyota",
    variants: ["2.7 4x2 MT", "Legender", "4x4 AT"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2009, to: 2016 },
      { from: 2016, to: 2025 },
    ],
    transmission: ["Manual", "Automatic"],
  },

  // Honda
  {
    name: "City",
    brand: "Honda",
    variants: ["SV", "V", "VX", "ZX"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 1998, to: 2008 },
      { from: 2008, to: 2014 },
      { from: 2014, to: 2020 },
      { from: 2020, to: 2025 },
    ],
    transmission: ["Manual", "CVT"],
  },

  // Volkswagen
  {
    name: "Polo",
    brand: "Volkswagen",
    variants: ["Trendline", "Comfortline", "Highline", "GT TSI"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2010, to: 2022 },
    ],
    transmission: ["Manual", "Automatic", "DSG"],
  },

  // MG
  {
    name: "Hector",
    brand: "MG",
    variants: ["Style", "Super", "Smart", "Sharp"],
    fuelType: ["Petrol", "Diesel", "Hybrid"],
    year: [
      { from: 2019, to: 2025 },
    ],
    transmission: ["Manual", "CVT", "DCT"],
  },

  // Renault
  {
    name: "Kwid",
    brand: "Renault",
    variants: ["RXL", "RXT", "Climber"],
    fuelType: ["Petrol"],
    year: [
      { from: 2015, to: 2025 },
    ],
    transmission: ["Manual", "AMT"],
  },

  // Nissan
  {
    name: "Magnite",
    brand: "Nissan",
    variants: ["XE", "XL", "XV", "XV Premium"],
    fuelType: ["Petrol"],
    year: [
      { from: 2020, to: 2025 },
    ],
    transmission: ["Manual", "CVT"],
  },

  // Jeep
  {
    name: "Compass",
    brand: "Jeep",
    variants: ["Sport", "Longitude", "Limited", "Model S"],
    fuelType: ["Petrol", "Diesel"],
    year: [
      { from: 2017, to: 2025 },
    ],
    transmission: ["Manual", "DCT", "Automatic"],
  },
];
