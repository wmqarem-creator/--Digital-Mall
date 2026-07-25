import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Compass, Star } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  mapAddress: string;
}

interface SanaaMapProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  readOnly?: boolean;
  onChange?: (data: LocationData) => void;
  storeName?: string;
}

// Famous zones/neighborhoods in Sana'a for search & select
const SANAA_NEIGHBORHOODS = [
  { name: 'شارع حدة (حي حدة السكني)', lat: 15.3185, lng: 44.1812, desc: 'صنعاء - شارع حدة الرئيسي - بجوار مركز ظمران التجاري' },
  { name: 'منطقة السبعين (حديقة السبعين)', lat: 15.3251, lng: 44.2023, desc: 'صنعاء - ميدان السبعين - مقابل جامع الصالح' },
  { name: 'شارع الخمسين (جنوب العاصمة)', lat: 15.3012, lng: 44.1754, desc: 'صنعاء - شارع الخمسين - تقاطع بيت بوس' },
  { name: 'حي التحرير (ميدان التحرير)', lat: 15.3531, lng: 44.2051, desc: 'صنعاء - ميدان التحرير - وسط العاصمة' },
  { name: 'شارع الستين الغربي (حي الجراف)', lat: 15.3423, lng: 44.1685, desc: 'صنعاء - شارع الستين الغربي - جوار مستشفى العلوم والتكنولوجيا' },
  { name: 'صنعاء القديمة (باب اليمن)', lat: 15.3524, lng: 44.2148, desc: 'صنعاء القديمة - حارة الملح - قرب باب اليمن التاريخي' },
  { name: 'منطقة الروضة (شمال صنعاء)', lat: 15.4121, lng: 44.2235, desc: 'صنعاء - منطقة الروضة - جوار مطار صنعاء الدولي القديم' },
  { name: 'شارع الدائري (حي الجامعة)', lat: 15.3485, lng: 44.1901, desc: 'صنعاء - شارع الدائري الغربي - أمام جامعة صنعاء الجديدة' },
];

export default function SanaaMap({
  initialLatitude = 15.3185,
  initialLongitude = 44.1812,
  initialAddress = 'صنعاء - شارع حدة الرئيسي',
  readOnly = false,
  onChange,
  storeName = 'المول الرقمي Digital Mall'
}: SanaaMapProps) {
  const [lat, setLat] = useState(initialLatitude);
  const [lng, setLng] = useState(initialLongitude);
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<typeof SANAA_NEIGHBORHOODS>([]);

  useEffect(() => {
    if (initialLatitude) setLat(initialLatitude);
    if (initialLongitude) setLng(initialLongitude);
    if (initialAddress) setAddress(initialAddress);
  }, [initialLatitude, initialLongitude, initialAddress]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element

    // Translate click X/Y on SVG to simulated coordinates in Sana'a
    // Sana'a bounds roughly: Lat [15.2800 to 15.4200], Lng [44.1400 to 44.2500]
    const mapWidth = rect.width;
    const mapHeight = rect.height;

    const clickedLng = 44.1400 + (x / mapWidth) * (44.2500 - 44.1400);
    const clickedLat = 15.4200 - (y / mapHeight) * (15.4200 - 15.2800); // Inverse Y since map top is North

    // Match closest neighborhood to generate a human address description
    let closestZone = SANAA_NEIGHBORHOODS[0];
    let minDistance = Infinity;
    SANAA_NEIGHBORHOODS.forEach(zone => {
      const d = Math.pow(zone.lat - clickedLat, 2) + Math.pow(zone.lng - clickedLng, 2);
      if (d < minDistance) {
        minDistance = d;
        closestZone = zone;
      }
    });

    const calculatedAddress = `صنعاء - قطاع ${closestZone.name.split(' ')[0]} - بالقرب من الإحداثيات (${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`;

    setLat(clickedLat);
    setLng(clickedLng);
    setAddress(calculatedAddress);

    if (onChange) {
      onChange({
        latitude: clickedLat,
        longitude: clickedLng,
        mapAddress: calculatedAddress
      });
    }
  };

  const handleSelectZone = (zone: typeof SANAA_NEIGHBORHOODS[0]) => {
    setLat(zone.lat);
    setLng(zone.lng);
    setAddress(zone.desc);
    setSearchQuery('');
    setFilteredNeighborhoods([]);

    if (onChange) {
      onChange({
        latitude: zone.lat,
        longitude: zone.lng,
        mapAddress: zone.desc
      });
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setFilteredNeighborhoods([]);
      return;
    }
    const filtered = SANAA_NEIGHBORHOODS.filter(zone => 
      zone.name.includes(val) || zone.desc.includes(val)
    );
    setFilteredNeighborhoods(filtered);
  };

  // Convert lat/lng coordinates to X/Y percentages on our SVG container
  // Lat [15.2800 to 15.4200], Lng [44.1400 to 44.2500]
  const markerX = ((lng - 44.1400) / (44.2500 - 44.1400)) * 100;
  const markerY = ((15.4200 - lat) / (15.4200 - 15.2800)) * 100;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-4 text-right" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-850 pb-3">
        <div>
          <h4 className="font-bold text-xs text-stone-200 flex items-center gap-1.5 justify-start">
            <Compass size={14} className="text-[#D4AF37] animate-spin" />
            <span>خريطة الموقع الجغرافي للمتجر (أمانة العاصمة صنعاء)</span>
          </h4>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {readOnly 
              ? `الموقع المحدد لـ ${storeName} على الخريطة التفاعلية` 
              : 'انقري لتحديد الدبوس الذهبي في أي قطاع داخل صنعاء أو ابحثي بالحي لربط الإحداثيات السحابية'}
          </p>
        </div>

        {/* Coords Badge */}
        <div className="bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 font-mono text-[10px] text-[#D4AF37] flex items-center gap-1.5 flex-row">
          <span>Lat: {lat.toFixed(4)}° N</span>
          <span className="text-stone-700">|</span>
          <span>Lng: {lng.toFixed(4)}° E</span>
        </div>
      </div>

      {/* Address Bar */}
      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-850 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-row-reverse text-right">
          <MapPin size={14} className="text-emerald-400 shrink-0" />
          <span className="text-xs text-stone-300 font-medium">{address}</span>
        </div>
        {!readOnly && (
          <span className="text-[9px] bg-amber-950/40 text-[#D4AF37] px-1.5 py-0.5 rounded border border-amber-900/30">
            محدد سحابياً
          </span>
        )}
      </div>

      {/* Search Neighborhoods (Only if not readOnly) */}
      {!readOnly && (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحثي عن حي في صنعاء (مثل: حدة، السبعين، باب اليمن، الستين)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2 px-10 text-[11px] text-white text-right placeholder-stone-600 focus:border-[#D4AF37] focus:outline-none"
            />
            <Search size={14} className="absolute right-3.5 top-2.5 text-stone-600" />
          </div>

          {filteredNeighborhoods.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-stone-950 border border-stone-800 rounded-xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto divide-y divide-stone-900">
              {filteredNeighborhoods.map((zone, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectZone(zone)}
                  className="w-full text-right p-2.5 text-[10px] text-stone-300 hover:bg-stone-900 flex flex-col gap-0.5 transition-colors"
                >
                  <span className="font-bold text-[#D4AF37]">{zone.name}</span>
                  <span className="text-[9px] text-stone-500">{zone.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Map Visual Stage */}
      <div 
        onClick={handleMapClick}
        className={`relative w-full aspect-[2/1] rounded-2xl bg-stone-950 overflow-hidden border border-stone-850 select-none ${
          readOnly ? 'cursor-default' : 'cursor-crosshair hover:border-amber-500/30'
        } transition-colors`}
      >
        {/* Abstract High-Tech Map Grid SVG Background */}
        <svg className="w-full h-full opacity-40" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Ring road representations */}
          <circle cx="500" cy="250" r="120" stroke="#1c1917" strokeWidth="3" />
          <circle cx="500" cy="250" r="220" stroke="#1c1917" strokeWidth="2" strokeDasharray="8 4" />
          <circle cx="500" cy="250" r="320" stroke="#1c1917" strokeWidth="1" />

          {/* Grid lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="#121214" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} stroke="#121214" strokeWidth="0.5" />
          ))}

          {/* Main Arteries & Street Representations (Sanaa abstract roads) */}
          {/* Ring roads, Hadda road, Sixty road */}
          <path d="M 100,250 Q 500,250 900,250" stroke="#1f1c18" strokeWidth="4" /> {/* Sixty road */}
          <path d="M 500,50 L 500,450" stroke="#1f1c18" strokeWidth="4" /> {/* Airport & Hadda Road axis */}
          <path d="M 200,100 L 800,400" stroke="#161517" strokeWidth="2" />
          <path d="M 200,400 L 800,100" stroke="#161517" strokeWidth="2" />

          {/* District Labels */}
          <text x="500" y="275" fill="#3f3f46" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">وسط العاصمة (التحرير)</text>
          <text x="500" y="360" fill="#3f3f46" fontSize="10" textAnchor="middle" fontFamily="sans-serif">حي حدة السكني</text>
          <text x="500" y="420" fill="#2d2d30" fontSize="9" textAnchor="middle" fontFamily="sans-serif">منطقة بيت بوس والخمسين</text>
          <text x="500" y="100" fill="#3f3f46" fontSize="10" textAnchor="middle" fontFamily="sans-serif">منطقة الروضة والمطار</text>
          <text x="700" y="250" fill="#2d2d30" fontSize="10" textAnchor="middle" fontFamily="sans-serif">صنعاء القديمة (شرقاً)</text>
          <text x="300" y="250" fill="#2d2d30" fontSize="10" textAnchor="middle" fontFamily="sans-serif">عصر وعيبان (غرباً)</text>
        </svg>

        {/* Highlighting predefined zones on map */}
        {SANAA_NEIGHBORHOODS.map((zone, idx) => {
          const zX = ((zone.lng - 44.1400) / (44.2500 - 44.1400)) * 100;
          const zY = ((15.4200 - zone.lat) / (15.4200 - 15.2800)) * 100;
          return (
            <div
              key={idx}
              className="absolute w-2 h-2 rounded-full bg-stone-800 border border-stone-700 -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${zX}%`, top: `${zY}%` }}
              title={zone.name}
            >
              <div className="hidden group-hover:block absolute bg-stone-900 border border-stone-800 text-[8px] text-stone-300 px-1.5 py-0.5 rounded -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-30">
                {zone.name.split(' ')[0]}
              </div>
            </div>
          );
        })}

        {/* Glowing Interactive Golden Custom Pin/Marker */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 pointer-events-none"
          style={{ left: `${markerX}%`, top: `${markerY}%` }}
        >
          {/* Pulse animations */}
          <div className="absolute w-10 h-10 -left-5 -top-5 rounded-full bg-[#D4AF37]/20 animate-ping border border-[#D4AF37]/10"></div>
          <div className="absolute w-5 h-5 -left-2.5 -top-2.5 rounded-full bg-emerald-500/10 animate-pulse"></div>

          {/* Icon */}
          <div className="relative text-[#D4AF37] flex flex-col items-center">
            <MapPin size={24} className="fill-[#D4AF37]/30 stroke-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] animate-bounce" />
            <div className="bg-[#D4AF37] text-neutral-950 font-black text-[8px] px-1.5 py-0.5 rounded shadow-lg border border-[#D4AF37]/50 -mt-0.5 whitespace-nowrap">
              {storeName}
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Hint */}
      {!readOnly && (
        <p className="text-[9px] text-stone-500 leading-normal text-right">
          💡 يمكنك النقر مباشرة في أي بقعة من الخريطة التفاعلية لتغيير الإحداثيات وتحديث موقع ومربعات التوصيل للمتجر تلقائياً في السحابة.
        </p>
      )}
    </div>
  );
}
