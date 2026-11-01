/**
 * Verified Centroid and Jurisdiction Coordinates for Indian States, UTs,
 * High Courts, and Major Districts.
 * Used by Leaflet Interactive Map for accurate pan/zoom and advocate pin placement.
 */

export const STATE_CENTROIDS = {
  // 28 Indian States
  "andhra-pradesh": { lat: 15.9129, lng: 79.74, zoom: 7 },
  "arunachal-pradesh": { lat: 28.218, lng: 94.7278, zoom: 7 },
  "assam": { lat: 26.2006, lng: 92.9376, zoom: 7 },
  "bihar": { lat: 25.0961, lng: 85.3131, zoom: 7 },
  "chhattisgarh": { lat: 21.2787, lng: 81.8661, zoom: 7 },
  "goa": { lat: 15.2993, lng: 74.124, zoom: 10 },
  "gujarat": { lat: 22.2587, lng: 71.1924, zoom: 7 },
  "haryana": { lat: 29.0588, lng: 76.0856, zoom: 8 },
  "himachal-pradesh": { lat: 31.1048, lng: 77.1734, zoom: 8 },
  "jharkhand": { lat: 23.6102, lng: 85.2799, zoom: 7 },
  "karnataka": { lat: 15.3173, lng: 75.7139, zoom: 7 },
  "kerala": { lat: 10.8505, lng: 76.2711, zoom: 7 },
  "madhya-pradesh": { lat: 22.9734, lng: 78.6569, zoom: 7 },
  "maharashtra": { lat: 19.7515, lng: 75.7139, zoom: 7 },
  "manipur": { lat: 24.6637, lng: 93.9063, zoom: 8 },
  "meghalaya": { lat: 25.467, lng: 91.3662, zoom: 8 },
  "mizoram": { lat: 23.1645, lng: 92.9376, zoom: 8 },
  "nagaland": { lat: 26.1584, lng: 94.5624, zoom: 8 },
  "odisha": { lat: 20.9517, lng: 85.0985, zoom: 7 },
  "punjab": { lat: 31.1471, lng: 75.3412, zoom: 8 },
  "rajasthan": { lat: 27.0238, lng: 74.2179, zoom: 7 },
  "sikkim": { lat: 27.533, lng: 88.5122, zoom: 9 },
  "tamil-nadu": { lat: 11.1271, lng: 78.6569, zoom: 7 },
  "telangana": { lat: 18.1124, lng: 79.0193, zoom: 7 },
  "tripura": { lat: 23.9408, lng: 91.9882, zoom: 8 },
  "uttar-pradesh": { lat: 26.8467, lng: 80.9462, zoom: 7 },
  "uttarakhand": { lat: 30.0668, lng: 79.0193, zoom: 8 },
  "west-bengal": { lat: 22.9868, lng: 87.855, zoom: 7 },

  // 8 Union Territories
  "andaman-and-nicobar-islands": { lat: 11.7401, lng: 92.6586, zoom: 7 },
  "chandigarh": { lat: 30.7333, lng: 76.7794, zoom: 12 },
  "dadra-and-nagar-haveli-and-daman-and-diu": { lat: 20.4283, lng: 72.8397, zoom: 10 },
  "delhi": { lat: 28.6139, lng: 77.209, zoom: 11 },
  "jammu-and-kashmir": { lat: 33.7782, lng: 76.5762, zoom: 7 },
  "ladakh": { lat: 34.1526, lng: 77.5771, zoom: 7 },
  "lakshadweep": { lat: 10.5667, lng: 72.6417, zoom: 9 },
  "puducherry": { lat: 11.9416, lng: 79.8083, zoom: 11 },
};

export const HIGH_COURT_COORDINATES = {
  "delhi": { name: "High Court of Delhi", lat: 28.6145, lng: 77.2389, seat: "New Delhi" },
  "uttar-pradesh": { name: "High Court of Judicature at Allahabad", lat: 25.4533, lng: 81.8267, seat: "Prayagraj" },
  "maharashtra": { name: "High Court of Judicature at Bombay", lat: 18.9298, lng: 72.8301, seat: "Mumbai" },
  "west-bengal": { name: "High Court at Calcutta", lat: 22.5702, lng: 88.3444, seat: "Kolkata" },
  "tamil-nadu": { name: "Madras High Court", lat: 13.0878, lng: 80.2874, seat: "Chennai" },
  "karnataka": { name: "High Court of Karnataka", lat: 12.9791, lng: 77.5913, seat: "Bengaluru" },
  "bihar": { name: "High Court of Judicature at Patna", lat: 25.6074, lng: 85.1276, seat: "Patna" },
  "madhya-pradesh": { name: "High Court of Madhya Pradesh", lat: 23.1686, lng: 79.9339, seat: "Jabalpur" },
  "punjab": { name: "Punjab and Haryana High Court", lat: 30.7588, lng: 76.8055, seat: "Chandigarh" },
  "haryana": { name: "Punjab and Haryana High Court", lat: 30.7588, lng: 76.8055, seat: "Chandigarh" },
  "chandigarh": { name: "Punjab and Haryana High Court", lat: 30.7588, lng: 76.8055, seat: "Chandigarh" },
  "rajasthan": { name: "Rajasthan High Court", lat: 26.2389, lng: 73.0243, seat: "Jodhpur" },
  "gujarat": { name: "High Court of Gujarat", lat: 23.0788, lng: 72.5303, seat: "Ahmedabad" },
  "kerala": { name: "High Court of Kerala", lat: 9.9816, lng: 76.2755, seat: "Kochi (Ernakulam)" },
  "lakshadweep": { name: "High Court of Kerala (Jurisdiction over Lakshadweep)", lat: 9.9816, lng: 76.2755, seat: "Kochi" },
  "telangana": { name: "High Court for the State of Telangana", lat: 17.3687, lng: 78.4727, seat: "Hyderabad" },
  "andhra-pradesh": { name: "High Court of Andhra Pradesh", lat: 16.5131, lng: 80.5165, seat: "Amaravati" },
  "odisha": { name: "High Court of Orissa", lat: 20.4625, lng: 85.883, seat: "Cuttack" },
  "jharkhand": { name: "High Court of Jharkhand", lat: 23.3441, lng: 85.3096, seat: "Ranchi" },
  "assam": { name: "Gauhati High Court", lat: 26.1927, lng: 91.7548, seat: "Guwahati" },
  "arunachal-pradesh": { name: "Gauhati High Court (Itanagar Bench)", lat: 27.0844, lng: 93.6053, seat: "Naharlagun" },
  "nagaland": { name: "Gauhati High Court (Kohima Bench)", lat: 25.6701, lng: 94.1077, seat: "Kohima" },
  "mizoram": { name: "Gauhati High Court (Aizawl Bench)", lat: 23.7271, lng: 92.7176, seat: "Aizawl" },
  "chhattisgarh": { name: "High Court of Chhattisgarh", lat: 22.0797, lng: 82.1409, seat: "Bilaspur" },
  "uttarakhand": { name: "High Court of Uttarakhand", lat: 29.3919, lng: 79.4542, seat: "Nainital" },
  "himachal-pradesh": { name: "High Court of Himachal Pradesh", lat: 31.1048, lng: 77.1734, seat: "Shimla" },
  "goa": { name: "High Court of Bombay at Goa", lat: 15.5284, lng: 73.8293, seat: "Porvorim (Panaji)" },
  "tripura": { name: "High Court of Tripura", lat: 23.8315, lng: 91.2868, seat: "Agartala" },
  "manipur": { name: "High Court of Manipur", lat: 24.817, lng: 93.9368, seat: "Imphal" },
  "meghalaya": { name: "High Court of Meghalaya", lat: 25.5788, lng: 91.8933, seat: "Shillong" },
  "sikkim": { name: "High Court of Sikkim", lat: 27.3389, lng: 88.6065, seat: "Gangtok" },
  "jammu-and-kashmir": { name: "High Court of Jammu & Kashmir and Ladakh", lat: 34.0837, lng: 74.7973, seat: "Srinagar / Jammu" },
  "ladakh": { name: "High Court of Jammu & Kashmir and Ladakh (Leh)", lat: 34.1526, lng: 77.5771, seat: "Leh" },
  "puducherry": { name: "Madras High Court (Jurisdiction over Puducherry)", lat: 13.0878, lng: 80.2874, seat: "Chennai" },
  "andaman-and-nicobar-islands": { name: "Calcutta High Court (Circuit Bench at Port Blair)", lat: 11.667, lng: 92.741, seat: "Port Blair" },
  "dadra-and-nagar-haveli-and-daman-and-diu": { name: "High Court of Bombay (Jurisdiction)", lat: 18.9298, lng: 72.8301, seat: "Mumbai" },
};

export const DISTRICT_CENTROIDS = {
  // Delhi
  "delhi": { lat: 28.6139, lng: 77.209 },
  "central delhi": { lat: 28.6448, lng: 77.2167 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  "south delhi": { lat: 28.5355, lng: 77.241 },
  "south east delhi": { lat: 28.5463, lng: 77.2736 },
  "south west delhi": { lat: 28.5823, lng: 77.05 },
  "west delhi": { lat: 28.6562, lng: 77.1082 },
  "north delhi": { lat: 28.6942, lng: 77.1895 },
  "north west delhi": { lat: 28.7299, lng: 77.1126 },
  "north east delhi": { lat: 28.7041, lng: 77.2773 },
  "east delhi": { lat: 28.6279, lng: 77.2954 },
  "shahdara": { lat: 28.6738, lng: 77.2953 },
  "dwarka": { lat: 28.5823, lng: 77.05 },
  "saket": { lat: 28.5244, lng: 77.2066 },
  "tis hazari": { lat: 28.6675, lng: 77.2183 },
  "rohini": { lat: 28.7383, lng: 77.1147 },
  "karkardooma": { lat: 28.6534, lng: 77.3006 },
  "patiala house": { lat: 28.6186, lng: 77.2348 },

  // Uttar Pradesh
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "noida": { lat: 28.5355, lng: 77.391 },
  "gautam buddha nagar": { lat: 28.5355, lng: 77.391 },
  "greater noida": { lat: 28.4744, lng: 77.504 },
  "ghaziabad": { lat: 28.6692, lng: 77.4538 },
  "kanpur": { lat: 26.4499, lng: 80.3319 },
  "kanpur nagar": { lat: 26.4499, lng: 80.3319 },
  "agra": { lat: 27.1767, lng: 78.0081 },
  "prayagraj": { lat: 25.4358, lng: 81.8463 },
  "allahabad": { lat: 25.4358, lng: 81.8463 },
  "varanasi": { lat: 25.3176, lng: 82.9739 },
  "meerut": { lat: 28.9845, lng: 77.7064 },
  "gorakhpur": { lat: 26.7606, lng: 83.3732 },
  "bareilly": { lat: 28.367, lng: 79.4304 },
  "aligarh": { lat: 27.8974, lng: 78.088 },
  "moradabad": { lat: 28.8389, lng: 78.7768 },
  "ayodhya": { lat: 26.7922, lng: 82.1998 },
  "mathura": { lat: 27.4924, lng: 77.6737 },
  "jhansi": { lat: 25.4484, lng: 78.5685 },

  // Maharashtra
  "mumbai": { lat: 18.922, lng: 72.8347 },
  "mumbai city": { lat: 18.922, lng: 72.8347 },
  "mumbai suburban": { lat: 19.076, lng: 72.8777 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "nagpur": { lat: 21.1458, lng: 79.0882 },
  "thane": { lat: 19.2183, lng: 72.9781 },
  "nashik": { lat: 19.9975, lng: 73.7898 },
  "aurangabad": { lat: 19.8762, lng: 75.3433 },
  "chhatrapati sambhajinagar": { lat: 19.8762, lng: 75.3433 },
  "navi mumbai": { lat: 19.033, lng: 73.0297 },
  "solapur": { lat: 17.6599, lng: 75.9064 },
  "kolhapur": { lat: 16.705, lng: 74.2433 },

  // Bihar
  "patna": { lat: 25.5941, lng: 85.1376 },
  "gaya": { lat: 24.7914, lng: 85.0002 },
  "muzaffarpur": { lat: 26.1209, lng: 85.3647 },
  "bhagalpur": { lat: 25.2425, lng: 86.9842 },
  "darbhanga": { lat: 26.1542, lng: 85.8918 },
  "purnia": { lat: 25.7771, lng: 87.4753 },
  "begusarai": { lat: 25.4182, lng: 86.1272 },

  // Haryana
  "gurugram": { lat: 28.4595, lng: 77.0266 },
  "gurgaon": { lat: 28.4595, lng: 77.0266 },
  "faridabad": { lat: 28.4089, lng: 77.3178 },
  "panchkula": { lat: 30.6942, lng: 76.8606 },
  "panipat": { lat: 29.3909, lng: 76.9635 },
  "ambala": { lat: 30.3782, lng: 76.7767 },
  "karnal": { lat: 29.6857, lng: 76.9905 },
  "rohtak": { lat: 28.8955, lng: 76.6066 },
  "hisar": { lat: 29.1492, lng: 75.7217 },
  "sonipat": { lat: 28.9931, lng: 77.0151 },

  // Rajasthan
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "jodhpur": { lat: 26.2389, lng: 73.0243 },
  "udaipur": { lat: 24.5854, lng: 73.7125 },
  "kota": { lat: 25.2138, lng: 75.8648 },
  "ajmer": { lat: 26.4499, lng: 74.6399 },
  "bikaner": { lat: 28.0229, lng: 73.3119 },
  "alwar": { lat: 27.553, lng: 76.6346 },
  "bhilwara": { lat: 25.3407, lng: 74.6313 },

  // Madhya Pradesh
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "indore": { lat: 22.7196, lng: 75.8577 },
  "jabalpur": { lat: 23.1815, lng: 79.9864 },
  "gwalior": { lat: 26.2183, lng: 78.1828 },
  "ujjain": { lat: 23.1765, lng: 75.7885 },
  "sagar": { lat: 23.8388, lng: 78.7378 },
  "rewa": { lat: 24.5362, lng: 81.3037 },
  "satna": { lat: 24.6005, lng: 80.8322 },

  // Punjab
  "ludhiana": { lat: 30.901, lng: 75.8573 },
  "amritsar": { lat: 31.634, lng: 74.8723 },
  "jalandhar": { lat: 31.326, lng: 75.5762 },
  "patiala": { lat: 30.3398, lng: 76.3869 },
  "bathinda": { lat: 30.211, lng: 74.9455 },
  "mohali": { lat: 30.7046, lng: 76.7179 },
  "sas nagar": { lat: 30.7046, lng: 76.7179 },

  // Karnataka
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru urban": { lat: 12.9716, lng: 77.5946 },
  "mysuru": { lat: 12.2958, lng: 76.6394 },
  "mysore": { lat: 12.2958, lng: 76.6394 },
  "hubballi": { lat: 15.3647, lng: 75.124 },
  "dharwad": { lat: 15.4589, lng: 75.0078 },
  "mangaluru": { lat: 12.9141, lng: 74.856 },
  "belagavi": { lat: 15.8497, lng: 74.4977 },
  "kalaburagi": { lat: 17.3297, lng: 76.8343 },

  // West Bengal
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "howrah": { lat: 22.5958, lng: 88.2636 },
  "north 24 parganas": { lat: 22.7188, lng: 88.4678 },
  "south 24 parganas": { lat: 22.1352, lng: 88.4016 },
  "siliguri": { lat: 26.7271, lng: 88.3953 },
  "darjeeling": { lat: 27.041, lng: 88.2663 },
  "asansol": { lat: 23.6739, lng: 86.9524 },

  // Tamil Nadu
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "madurai": { lat: 9.9252, lng: 78.1198 },
  "tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
  "salem": { lat: 11.6643, lng: 78.146 },

  // Gujarat
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "surat": { lat: 21.1702, lng: 72.8311 },
  "vadodara": { lat: 22.3072, lng: 73.1812 },
  "rajkot": { lat: 22.3039, lng: 70.8022 },
  "gandhinagar": { lat: 23.2156, lng: 72.6369 },

  // Kerala
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
  "kochi": { lat: 9.9312, lng: 76.2673 },
  "ernakulam": { lat: 9.9816, lng: 76.2999 },
  "kozhikode": { lat: 11.2588, lng: 75.7804 },
  "thrissur": { lat: 10.5276, lng: 76.2144 },

  // Telangana
  "hyderabad": { lat: 17.385, lng: 78.4867 },
  "warangal": { lat: 17.9689, lng: 79.5941 },
  "karimnagar": { lat: 18.4386, lng: 79.1288 },
  "ranga reddy": { lat: 17.4399, lng: 78.4983 },

  // Andhra Pradesh
  "visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "vijayawada": { lat: 16.5062, lng: 80.648 },
  "guntur": { lat: 16.3067, lng: 80.4365 },
  "tirupati": { lat: 13.6288, lng: 79.4192 },

  // Odisha
  "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "cuttack": { lat: 20.4625, lng: 85.883 },
  "rourkela": { lat: 22.2604, lng: 84.8536 },

  // Jharkhand
  "ranchi": { lat: 23.3441, lng: 85.3096 },
  "jamshedpur": { lat: 22.8046, lng: 86.2029 },
  "dhanbad": { lat: 23.7957, lng: 86.4304 },

  // Assam
  "guwahati": { lat: 26.1445, lng: 91.7362 },
  "kamrup": { lat: 26.3117, lng: 91.5979 },
  "silchar": { lat: 24.8333, lng: 92.7789 },
  "dibrugarh": { lat: 27.4728, lng: 94.912 },

  // Chhattisgarh
  "raipur": { lat: 21.2514, lng: 81.6296 },
  "bilaspur": { lat: 22.0797, lng: 82.1409 },
  "durg": { lat: 21.1904, lng: 81.2849 },

  // Uttarakhand
  "dehradun": { lat: 30.3165, lng: 78.0322 },
  "haridwar": { lat: 29.9457, lng: 78.1642 },
  "nainital": { lat: 29.3919, lng: 79.4542 },

  // Goa
  "north goa": { lat: 15.5284, lng: 73.8293 },
  "south goa": { lat: 15.2736, lng: 73.958 },
  "panaji": { lat: 15.4909, lng: 73.8278 },

  // Himachal Pradesh
  "shimla": { lat: 31.1048, lng: 77.1734 },
  "dharamshala": { lat: 32.219, lng: 76.3234 },
  "kullu": { lat: 31.9579, lng: 77.1095 },

  // Jammu and Kashmir
  "srinagar": { lat: 34.0837, lng: 74.7973 },
  "jammu": { lat: 32.7266, lng: 74.857 },

  // Ladakh
  "leh": { lat: 34.1526, lng: 77.5771 },
  "kargil": { lat: 34.5539, lng: 76.1349 },

  // Puducherry
  "puducherry": { lat: 11.9416, lng: 79.8083 },
  "karaikal": { lat: 10.9254, lng: 79.838 },

  // Chandigarh
  "chandigarh": { lat: 30.7333, lng: 76.7794 },

  // Andaman and Nicobar Islands
  "port blair": { lat: 11.667, lng: 92.741 },
};

/**
 * Resolves location coordinates for a state, district, or lawyer.
 */
export function resolveLocationCoords(stateSlug, districtOrCity) {
  if (districtOrCity) {
    const key = districtOrCity.toLowerCase().trim();
    if (DISTRICT_CENTROIDS[key]) {
      return DISTRICT_CENTROIDS[key];
    }
  }

  if (stateSlug && STATE_CENTROIDS[stateSlug]) {
    return STATE_CENTROIDS[stateSlug];
  }

  return { lat: 20.5937, lng: 78.9629, zoom: 5 };
}
