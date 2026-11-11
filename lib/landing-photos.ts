export interface LandingPhoto {
  src: string;
  alt: string;
  caption: string;
  author: string;
  licence: string;
  licenceUrl: string;
  sourceUrl: string;
  fileTitle: string;
}

/**
 * Openly licensed photographs of agriculture in Tanzania.
 * Files in /public/photos are resized WebP copies; the licence of each original still applies.
 * Full credits: /photos/CREDITS.md
 */
export const LANDING_PHOTOS: LandingPhoto[] = [
  {
    src: "/photos/tomato-kigoma.webp",
    alt: "Ripe red tomatoes hanging on the vine among green leaves on a farm in Kigoma, Tanzania.",
    caption: "Tomato farming, Kigoma",
    author: "Erasmus Kamugisha",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A_local_Tomato%27s_farm_,Kigoma.jpg",
    fileTitle: "A local Tomato's farm, Kigoma",
  },
  {
    src: "/photos/tea-tukuyu.webp",
    alt: "Contoured green tea fields at Tukuyu in Tanzania's southern highlands, with trees and mountains under cloud.",
    caption: "Tea fields, Tukuyu",
    author: "Sara & Joachim",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_fields,_Tukuyu,_Tanzania.jpg",
    fileTitle: "Tea fields, Tukuyu, Tanzania",
  },
  {
    src: "/photos/tea-iringa.webp",
    alt: "A worker wearing a blue headwrap and carrying a large woven basket picks tea leaves on a plantation in the Iringa Region, Tanzania.",
    caption: "Tea picking, Iringa",
    author: "Martin Benjamin",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_plantation_picking.JPG",
    fileTitle: "Tea plantation picking",
  },
  {
    src: "/photos/rice-mahande.webp",
    alt: "A farmer in a brown jacket tends young rice plants standing in water at the Mahande irrigation scheme in Tanzania.",
    caption: "Irrigated rice, Mahande",
    author: "USAID in Africa / CNFA",
    licence: "Public domain",
    licenceUrl: "https://commons.wikimedia.org/wiki/File:Rice_Field_(12756462863).jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rice_Field_(12756462863).jpg",
    fileTitle: "Rice Field",
  },
  {
    src: "/photos/maize-moshi.webp",
    alt: "Young maize plants growing in reddish soil on a farm in Moshi, Tanzania, under a cloudy evening sky.",
    caption: "Maize, Moshi",
    author: "Ramadhani Mushi",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Maize_Farm_Landscape_in_Moshi,_Tanzania.jpg",
    fileTitle: "Maize Farm Landscape in Moshi, Tanzania",
  },
  {
    src: "/photos/sisal-north.webp",
    alt: "Rows of sisal plants in a dry field in northern Tanzania, with tall flower stalks against a clear blue sky.",
    caption: "Sisal, northern Tanzania",
    author: "Joachim Huber",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sisal_Fields_in_Northern_Tanzania.jpg",
    fileTitle: "Sisal Fields in Northern Tanzania",
  },
  {
    src: "/photos/fish-dar.webp",
    alt: "People preparing and selling fish at a smoky market hall in Dar es Salaam, Tanzania.",
    caption: "Fish market, Dar es Salaam",
    author: "Rod Waddington",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fish_Market,_Tanzania_(10147233393).jpg",
    fileTitle: "Fish Market, Tanzania",
  },
  {
    src: "/photos/cattle-natron.webp",
    alt: "A Maasai herder walks with cattle under an acacia tree near Lake Natron in Tanzania, with mountains in the distance.",
    caption: "Cattle, Lake Natron",
    author: "Nevit Dilmen",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flora_of_Tanzania_2247_Nevit.jpg",
    fileTitle: "Flora of Tanzania 2247",
  },
];
