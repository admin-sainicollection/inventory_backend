export const CAR_MODELS = [
  // Maruti Suzuki
  {
    name: "Alto",
    brand: { name: "Maruti Suzuki", logo: "https://carnish.in/wp-content/uploads/2024/09/maruti-suzuki.png", parentCompany: "Suzuki Motor Corporation" },
    baseImage: "https://imgd.aeplcdn.com/664x374/n/u1puesa_1463330.jpg",
    variants: ["800 Std", "LXi", "VXi"],
    fuelTypes: ["Petrol", "CNG"],
    transmissions: ["Manual"],
    generations: [
      { from: "2000", to: "2012", images: ["https://stimg.cardekho.com/images/car-images/large/Maruti/Maruti-Alto/047.jpg","https://imgd.aeplcdn.com/1280x720/cw/cars/discontinued/maruti-suzuki/alto-2000-2005.jpg"] },
      { from: "2012", to: "2020", images: ["https://www.v3cars.com/media/model-imgs/1652417384-Maruti-Alto.jpg","https://www.v3cars.com/media/model-imgs/1652417384-Maruti-Alto.jpg"] },
    ],
  },
  {
    name: "Alto K10",
    brand: { name: "Maruti Suzuki", logo: "https://carnish.in/wp-content/uploads/2024/09/maruti-suzuki.png", parentCompany: "Suzuki Motor Corporation" },
    baseImage: "https://www.varunmaruti.com/uploads/products/colors/altok-10-metallic-silky-silver1.png",
    variants: ["LXi", "VXi", "VXi+ AMT"],
    fuelTypes: ["Petrol", "CNG"],
    transmissions: ["Manual", "AMT"],
    generations: [
      { from: "2010", to: "2014", images: ["https://imgd.aeplcdn.com/664x374/cw/cars/discontinued/maruti-suzuki/alto-k10-2010-2014.jpg?q=80"] },
      { from: "2014", to: "2023", images: ["https://www.carblogindia.com/wp-content/uploads/2014/11/2014-15-Maruti-Alto-K10-New-Model-1.jpg"] },
    ],
  },
  {
    name: "Wagon R",
    brand: { name: "Maruti Suzuki", logo: "https://carnish.in/wp-content/uploads/2024/09/maruti-suzuki.png", parentCompany: "Suzuki Motor Corporation" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Wagon-R/10363/1755843602295/front-left-side-47.jpg",
    variants: ["LXi", "VXi", "ZXi"],
    fuelTypes: ["Petrol", "CNG"],
    transmissions: ["Manual", "AMT"],
    generations: [
      { from: "2000", to: "2010", images: ["https://imgd.aeplcdn.com/642x336/cw/cars/discontinued/maruti-suzuki/wagon-r-2006-2010.jpg?q=80"] },
      { from: "2010", to: "2019", images: ["https://www.globalsuzuki.com/globalnews/2010/img/0423b.jpg"] },
      { from: "2019", to: "2025", images: ["https://stimg.cardekho.com/images/carexteriorimages/630x420/Maruti/Wagon-R/10363/1741236373749/exterior-image-166.jpg?tr=w-360"] },
    ],
  },
  {
    name: "Swift",
    brand: { name: "Maruti Suzuki", logo: "https://carnish.in/wp-content/uploads/2024/09/maruti-suzuki.png", parentCompany: "Suzuki Motor Corporation" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Swift/9226/1755777061785/front-left-side-47.jpg",
    variants: ["LXi", "VXi", "ZXi", "ZXi+"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "AMT"],
    generations: [
      { from: "2005", to: "2011", images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjZzusILih77HDyy-1iIh92pzETncqTN8lUA&s"] },
      { from: "2011", to: "2018", images: ["https://imgd.aeplcdn.com/640X480/vimages/202510/4202910_140768_1_1760975580685.jpg?qp=80&fit=true"] },
      { from: "2018", to: "2025", images: ["https://v3cars.com/media/model-imgs/564348Swift%20Background.webp"] },
    ],
  },
  {
    name: "Baleno",
    brand: { name: "Maruti Suzuki", logo: "https://carnish.in/wp-content/uploads/2024/09/maruti-suzuki.png", parentCompany: "Suzuki Motor Corporation" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Baleno/10492/1755851821713/front-left-side-47.jpg",
    variants: ["Sigma", "Delta", "Zeta", "Alpha"],
    fuelTypes: ["Petrol"],
    transmissions: ["Manual", "AMT", "CVT"],
    generations: [
      { from: "2015", to: "2022", images: ["https://imgd.aeplcdn.com/664x374/cw/ec/21723/Maruti-Suzuki-Baleno-Right-Front-Three-Quarter-147250.jpg"] },
      { from: "2022", to: "2025", images: ["https://media.spinny.com/sp-file-system/public/2025-01-23/a62c483bbcf74d53838f433d0769b345/file.JPG"] },
    ],
  },

  // Hyundai
  {
    name: "i20",
    brand: { name: "Hyundai", logo: "https://logos-world.net/wp-content/uploads/2021/03/Hyundai-Logo.png", parentCompany: "Hyundai Motor Company" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/630x420/Hyundai/i20/11092/1755774177956/front-left-side-47.jpg",
    variants: ["Magna", "Sportz", "Asta"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "CVT", "iMT"],
    generations: [
      { from: "2008", to: "2014", images: ["https://www.mahindrafirstchoice.com/_next/image?url=https%3A%2F%2Fmedia.mahindrafirstchoice.com%2Flive_web_images%2Fusedcarsimg%2Fmfc%2F228%2F600842%2Fcover_image-20240510132502.jpg"] },
      { from: "2014", to: "2020", images: ["https://imgd.aeplcdn.com/664x374/cw/ec/38332/Hyundai-Elite-i20-Right-Front-Three-Quarter-148187.jpg"] },
      { from: "2020", to: "2025", images: ["https://imgd.aeplcdn.com/664x374/n/cw/ec/150603/i20-exterior-front-view.jpeg"] },
    ],
  },
  {
    name: "Creta",
    brand: { name: "Hyundai", logo: "https://logos-world.net/wp-content/uploads/2021/03/Hyundai-Logo.png", parentCompany: "Hyundai Motor Company" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Hyundai/Creta/8667/1755765115423/front-left-side-47.jpg",
    variants: ["E", "S", "SX", "SX(O)"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "IVT", "DCT"],
    generations: [
      { from: "2015", to: "2020", images: ["https://media.zigcdn.com/media/model/2019/Sep/hyundai-creta_360x240.jpg"] },
      { from: "2020", to: "2025", images: ["https://stimg.cardekho.com/images/carexteriorimages/630x420/Hyundai/Creta/8667/1755765115423/front-left-side-47.jpg"] },
    ],
  },

  // Tata
  {
    name: "Nexon",
    brand: { name: "Tata Motors", logo: "https://logos-world.net/wp-content/uploads/2021/10/Tata-Symbol.png", parentCompany: "Tata Group" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/630x420/Tata/Nexon/9675/1756363921933/front-left-side-47.jpg",
    variants: ["XE", "XM", "XZ", "XZ+"],
    fuelTypes: ["Petrol", "Diesel", "EV"],
    transmissions: ["Manual", "AMT", "Automatic"],
    generations: [
      { from: "2017", to: "2020", images: ["https://imgd.aeplcdn.com/664x374/cw/ec/16868/Tata-Nexon-Right-Front-Three-Quarter-107996.jpg"] },
      { from: "2020", to: "2025", images: ["https://media.spinny.com/sp-file-system/public/2025-01-17/ce4c5ddd996046719f58b602b77ed1aa/file.JPG"] },
    ],
  },

  // Mahindra
  {
    name: "Scorpio",
    brand: { name: "Mahindra", logo: "https://logos-world.net/wp-content/uploads/2021/09/Mahindra-Mahindra-New-Logo.png", parentCompany: "Mahindra & Mahindra Ltd." },
    baseImage: "https://img.gaadicdn.com/images/car-images/large/Mahindra/Mahindra-Scorpio/6124/Napoli-Black.jpg",
    variants: ["S3", "S5", "S7", "S11"],
    fuelTypes: ["Diesel"],
    transmissions: ["Manual"],
    generations: [
      { from: "2002", to: "2014", images: ["https://imgd.aeplcdn.com/1280x720/cw/cars/discontinued/mahindra/scorpio-2009-2014.jpg"] },
      { from: "2014", to: "2022", images: ["https://stimg.cardekho.com/images/car-images/large/Mahindra/Mahindra-Scorpio/6124/Molten-Red.jpg"] },
    ],
  },
  {
    name: "XUV700",
    brand: { name: "Mahindra", logo: "https://logos-world.net/wp-content/uploads/2021/09/Mahindra-Mahindra-New-Logo.png", parentCompany: "Mahindra & Mahindra Ltd." },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/large/Mahindra/XUV700/10794/1755867567125/front-left-side-47.jpg",
    variants: ["MX", "AX3", "AX5", "AX7"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "Automatic"],
    generations: [
      { from: "2021", to: "2025", images: ["https://stimg.cardekho.com/images/carexteriorimages/930x620/Mahindra/XUV700/10794/1758802473303/front-left-side-47.jpg"] },
    ],
  },

  // Kia
  {
    name: "Seltos",
    brand: { name: "Kia", logo: "https://freelogopng.com/images/all_img/1686590236old-kia-logo-png.png", parentCompany: "Hyundai Motor Company" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Kia/Seltos/8709/1755775088156/front-left-side-47.jpg",
    variants: ["HTE", "HTK", "HTX", "GTX"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "IVT", "DCT"],
    generations: [
      { from: "2019", to: "2025", images: ["https://stimg.cardekho.com/images/carexteriorimages/930x620/Kia/Seltos/7111/1678424780936/front-left-side-47.jpg"] },
    ],
  },

  // Toyota
  {
    name: "Fortuner",
    brand: { name: "Toyota", logo: "https://media-s3-us-east-1.ceros.com/ceros-marketing/images/2020/07/27/2142c703bb605d17d40d01fa3def99e6/toyota-logos-brands-10.png", parentCompany: "Toyota Motor Corporation" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Toyota/Fortuner/10904/1755846017683/front-left-side-47.jpg",
    variants: ["2.7 4x2 MT", "Legender", "4x4 AT"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "Automatic"],
    generations: [
      { from: "2009", to: "2016", images: ["https://stimg.cardekho.com/images/car-images/large/Toyota/Toyota-Fortuner/silver-metallic.jpg"] },
      { from: "2016", to: "2021", images: ["https://imgd.aeplcdn.com/1280x720/n/cw/ec/19812/fortuner-exterior-right-front-three-quarter-2.jpeg"] },
      { from: "2021", to: "2025", images: ["https://imgd.aeplcdn.com/1920x1080/n/cw/ec/44709/fortuner-exterior-right-front-three-quarter-28.png"] },
    ],
  },

  // Honda
  {
    name: "City",
    brand: { name: "Honda", logo: "https://img.lazcdn.com/g/ff/kf/S6a01e53d35224c9b9b114903c9795e6eE.png_720x720q80.png", parentCompany: "Honda Motor Co., Ltd." },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Honda/City/12093/1755764990493/front-left-side-47.jpg",
    variants: ["SV", "V", "VX", "ZX"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "CVT"],
    generations: [
      { from: "1998", to: "2008", images: ["https://imgd.aeplcdn.com/664x374/cw/cars/discontinued/honda/city-1998-2000.jpg"] },
      { from: "2008", to: "2014", images: ["https://imgd.aeplcdn.com/1920x1080/ec/36/10/9733/img/m/Honda-City-Right-Front-Three-Quarter-49020_ol.jpg"] },
      { from: "2014", to: "2020", images: ["https://imgd.aeplcdn.com/664x374/cw/ec/11592/Honda-City-Right-Front-Three-Quarter-67596.jpg"] },
      { from: "2020", to: "2025", images: ["https://imgd.aeplcdn.com/1920x1080/n/cw/ec/134287/city-exterior-right-front-three-quarter-78.jpeg"] },
    ],
  },

  // Volkswagen
  {
    name: "Polo",
    brand: { name: "Volkswagen", logo: "https://1000logos.net/wp-content/uploads/2021/04/Volkswagen-logo.png", parentCompany: "Volkswagen Group" },
    baseImage: "https://m.media-amazon.com/images/I/51N1TdJC5lL._UF894,1000_QL80_.jpg",
    variants: ["Trendline", "Comfortline", "Highline", "GT TSI"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "Automatic", "DSG"],
    generations: [
      { from: "2010", to: "2022", images: ["https://img.onmanorama.com/content/dam/mm/en/news/business/images/2022/3/1/volkswagen-polo-new-model.jpg"] },
    ],
  },

  // MG
  {
    name: "Hector",
    brand: { name: "MG Motor", logo: "https://thefederal.com/file/2021/09/MG-1.png", parentCompany: "SAIC Motor" },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/930x620/MG/Hector/10949/1755845009584/front-left-side-47.jpg",
    variants: ["Style", "Super", "Smart", "Sharp"],
    fuelTypes: ["Petrol", "Diesel", "Hybrid"],
    transmissions: ["Manual", "CVT", "DCT"],
    generations: [
      { from: "2019", to: "2021", images: ["https://imgd.aeplcdn.com/664x374/n/cw/ec/36756/hector-exterior-right-front-three-quarter-166302.jpeg"] },
    ],
  },

  // Renault
  {
    name: "Kwid",
    brand: { name: "Renault", logo: "https://media.whichcar.com.au/uploads/2021/08/0fe9afa2-renault-627x768.png", parentCompany: "Renault Group" },
    baseImage: "https://media.zigcdn.com/media/model/2025/Apr/front-1-4-left-1105916484_600x400.jpg",
    variants: ["RXL", "RXT", "Climber"],
    fuelTypes: ["Petrol"],
    transmissions: ["Manual", "AMT"],
    generations: [
      { from: "2015", to: "2022", images: ["https://www.v3cars.com/media/model-imgs/1646211901-Renault-Kwid.jpg"] },
    ],
  },

  // Nissan
  {
    name: "Magnite",
    brand: { name: "Nissan", logo: "https://www.edigitalagency.com.au/wp-content/uploads/new-Nissan-logo-black-png-large-size.png", parentCompany: "Nissan Motor Co. Ltd." },
    baseImage: "https://stimg.cardekho.com/images/carexteriorimages/630x420/Nissan/Magnite/8127/1608191740345/front-left-side-47.jpg",
    variants: ["XE", "XL", "XV", "XV Premium"],
    fuelTypes: ["Petrol"],
    transmissions: ["Manual", "CVT"],
    generations: [
      { from: "2020", to: "2025", images: ["https://stimg.cardekho.com/images/carexteriorimages/930x620/Nissan/Magnite/11793/1760004620755/front-left-side-47.jpg"] },
    ],
  },

  // Jeep
  {
    name: "Compass",
    brand: { name: "Jeep", logo: "https://logos-world.net/wp-content/uploads/2021/09/Jeep-Logo.png", parentCompany: "Stellantis" },
    baseImage: "https://di-uploads-pod11.dealerinspire.com/cdjconfidential/uploads/2019/02/19Jeep-Compass-Jellybean-Sport-Red.png",
    variants: ["Sport", "Longitude", "Limited", "Model S"],
    fuelTypes: ["Petrol", "Diesel"],
    transmissions: ["Manual", "DCT", "Automatic"],
    generations: [
      { from: "2017", to: "2025", images: ["https://imgd.aeplcdn.com/642x336/n/cw/ec/47051/compass-exterior-right-front-three-quarter-83.jpeg"] },
    ],
  },
];
