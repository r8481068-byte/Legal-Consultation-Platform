import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  MapPin,
  ShieldCheck,
  Scale,
  Gavel,
  ChevronRight,
  Info
} from "lucide-react";
import {
  STATE_CENTROIDS,
  HIGH_COURT_COORDINATES,
  DISTRICT_CENTROIDS,
  resolveLocationCoords
} from "../data/indiaCoordinates";

// Fix standard Leaflet default icon path issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom crisp SVG DivIcon for High Court landmark
function createHighCourtMarker(name) {
  return L.divIcon({
    className: "custom-hc-marker",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: linear-gradient(135deg, #78350f, #b45309);
        border: 2px solid #fef3c7;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(180, 83, 9, 0.45);
        cursor: pointer;
      ">
        <svg style="transform: rotate(45deg); width: 20px; height: 20px; color: #ffffff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/>
          <path d="m16 16 6-6"/>
          <path d="m8 8 6-6"/>
          <path d="m9 7 8 8"/>
          <path d="m21 11-8-8"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });
}

// Create custom crisp SVG DivIcon for Lawyers
function createLawyerMarker(isVerified = true, index = 0) {
  const bg = isVerified ? "linear-gradient(135deg, #1e3a8a, #172554)" : "linear-gradient(135deg, #334155, #0f172a)";
  const border = isVerified ? "#fbbf24" : "#94a3b8";
  const iconColor = isVerified ? "#fbbf24" : "#f1f5f9";

  return L.divIcon({
    className: `custom-lawyer-marker-${index}`,
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        background: ${bg};
        border: 2px solid ${border};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        <svg style="transform: rotate(45deg); width: 17px; height: 17px; color: ${iconColor};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
          <path d="M7 21h10"/>
          <path d="M12 3v18"/>
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
}

export default function StateLawyersMap({
  stateData,
  lawyers = [],
  selectedDistrict = "All Districts",
  onSelectDistrict
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef(null);

  const stateSlug = stateData?.slug || "delhi";
  const stateCentroid = STATE_CENTROIDS[stateSlug] || { lat: 28.6139, lng: 77.209, zoom: 11 };
  const highCourtInfo = HIGH_COURT_COORDINATES[stateSlug] || null;

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [stateCentroid.lat, stateCentroid.lng],
      zoom: stateCentroid.zoom,
      zoomControl: true,
      scrollWheelZoom: false, // Prevents unintended page scroll interference
      attributionControl: true
    });

    // Add high-resolution OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update center, view and markers whenever state, district, or lawyers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();

    // 1. Determine map target center & zoom
    let targetLat = stateCentroid.lat;
    let targetLng = stateCentroid.lng;
    let targetZoom = stateCentroid.zoom;

    if (selectedDistrict && selectedDistrict !== "All Districts") {
      const distCoords = DISTRICT_CENTROIDS[selectedDistrict.toLowerCase().trim()];
      if (distCoords) {
        targetLat = distCoords.lat;
        targetLng = distCoords.lng;
        targetZoom = Math.max(stateCentroid.zoom + 2, 11);
      }
    }

    // Smoothly fly to target center
    map.flyTo([targetLat, targetLng], targetZoom, {
      duration: 1.0,
      easeLinearity: 0.25
    });

    // 2. Add High Court landmark marker if applicable
    if (highCourtInfo) {
      const hcMarker = L.marker([highCourtInfo.lat, highCourtInfo.lng], {
        icon: createHighCourtMarker(highCourtInfo.name),
        title: highCourtInfo.name,
        zIndexOffset: 500
      });

      const hcPopupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 200px; color: #0f172a;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: #b45309; text-transform: uppercase; font-size: 10px; margin-bottom: 4px;">
            <span>Constitutional Seat</span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${highCourtInfo.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            Principal Seat: <strong>${highCourtInfo.seat}</strong>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; font-size: 11px; color: #334155;">
            State-level supervisory, writ, and appellate jurisdiction for ${stateData?.name || "this jurisdiction"}.
          </div>
        </div>
      `;

      hcMarker.bindPopup(hcPopupContent, { className: "custom-leaflet-popup" });
      markersLayer.addLayer(hcMarker);
    }

    // 3. Plot Lawyers Markers
    const districtAdvocateCounts = {};

    lawyers.forEach((lawyer, index) => {
      let lat = lawyer.latitude;
      let lng = lawyer.longitude;

      const lawyerCity = (lawyer.district || lawyer.city || stateData?.capital || "").trim();
      const cityKey = lawyerCity.toLowerCase();

      // If no explicit GPS stored on lawyer, use verified district/city centroid
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        const centroid = DISTRICT_CENTROIDS[cityKey] || stateCentroid;
        // Reproducible small jitter for multiple advocates in same district to prevent overlapping pins
        const countInCity = districtAdvocateCounts[cityKey] || 0;
        districtAdvocateCounts[cityKey] = countInCity + 1;

        const angle = (countInCity * 137.5) * (Math.PI / 180);
        const radius = countInCity === 0 ? 0 : 0.006 * Math.sqrt(countInCity);

        lat = centroid.lat + radius * Math.cos(angle);
        lng = centroid.lng + radius * Math.sin(angle);
      }

      const isVerified = lawyer.verificationStatus === "approved";
      const lawyerName = lawyer.user?.name || lawyer.name || "Verified Advocate";
      const specializations = Array.isArray(lawyer.specialization)
        ? lawyer.specialization.slice(0, 2).join(", ")
        : (lawyer.specialization || "General Practice");
      const fee = lawyer.consultationFee ? `₹${Number(lawyer.consultationFee).toLocaleString("en-IN")}` : "Contact for fee";
      const exp = lawyer.experienceYears ? `${lawyer.experienceYears} Yrs Exp.` : "Experienced";
      const rating = lawyer.averageRating ? `${Number(lawyer.averageRating).toFixed(1)} ★` : "5.0 ★";
      const profileImage = lawyer.user?.profileImage || lawyer.profileImage;

      const lawyerMarker = L.marker([lat, lng], {
        icon: createLawyerMarker(isVerified, index),
        title: lawyerName,
        zIndexOffset: 1000 + index
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 220px; color: #0f172a; padding: 2px;">
          <div style="display: flex; items-center; gap: 8px; margin-bottom: 8px;">
            ${
              profileImage
                ? `<img src="${profileImage}" alt="${lawyerName}" style="width: 40px; height: 40px; border-radius: 10px; object-fit: cover; border: 1px solid #cbd5e1;" onerror="this.style.display='none'" />`
                : `<div style="width: 40px; height: 40px; border-radius: 10px; background: #1e3a8a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${lawyerName.charAt(0)}</div>`
            }
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 800; font-size: 13px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${lawyerName}
              </div>
              <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                ${
                  isVerified
                    ? `<span style="background: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">✓ Bar Verified</span>`
                    : ""
                }
                <span style="background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px;">${rating}</span>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 6px; font-size: 11px; color: #475569;">
            <div style="margin-bottom: 2px;"><strong>Specialization:</strong> ${specializations}</div>
            <div style="margin-bottom: 2px;"><strong>Practice Location:</strong> ${lawyerCity || stateData?.name}</div>
            <div><strong>Experience:</strong> ${exp} | <strong>Fee:</strong> <span style="color: #1e3a8a; font-weight: 800;">${fee}</span></div>
          </div>

          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end;">
            <a
              href="/lawyers/${lawyer._id}"
              style="display: inline-flex; align-items: center; gap: 4px; background: #1e3a8a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 6px;"
            >
              View Profile →
            </a>
          </div>
        </div>
      `;

      lawyerMarker.bindPopup(popupHtml, { className: "custom-leaflet-popup" });
      markersLayer.addLayer(lawyerMarker);
    });
  }, [stateData, lawyers, selectedDistrict, stateCentroid, highCourtInfo]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
      }).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
      }).catch(() => {});
    }
  }, []);

  // Handle Reset View
  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([stateCentroid.lat, stateCentroid.lng], stateCentroid.zoom, {
      duration: 1.0
    });
    if (onSelectDistrict) {
      onSelectDistrict("All Districts");
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all ${
        isFullscreen ? "p-0 h-screen w-screen rounded-none z-50 fixed inset-0" : ""
      }`}
    >
      {/* MAP HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Jurisdiction Map — {stateData?.name}</span>
              <span className="rounded-md bg-blue-900/80 px-2 py-0.5 text-[10px] font-semibold text-blue-200">
                {lawyers.length} Advocate{lawyers.length === 1 ? "" : "s"} Mapped
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {highCourtInfo ? `${highCourtInfo.name} (${highCourtInfo.seat}) & District Registries` : `Administrative Jurisdiction Map for ${stateData?.name}`}
            </p>
          </div>
        </div>

        {/* MAP ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            title="Reset map view to whole state"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset State View</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* LEAFLET CONTAINER */}
      <div
        ref={mapContainerRef}
        className={`w-full ${isFullscreen ? "h-[calc(100vh-65px)]" : "h-[420px] sm:h-[480px]"} bg-slate-100 z-10`}
      />

      {/* FLOATING MAP LEGEND & BADGES */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-lg pointer-events-auto">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>High Court Seat</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-lg pointer-events-auto">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm" />
          <span>Verified Advocates ({lawyers.length})</span>
        </div>

        {selectedDistrict && selectedDistrict !== "All Districts" && (
          <div className="flex items-center gap-1.5 rounded-xl bg-blue-900/95 backdrop-blur-md border border-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg pointer-events-auto">
            <MapPin className="h-3 w-3 text-amber-400" />
            <span>Focused on: {selectedDistrict}</span>
          </div>
        )}
      </div>

      {/* EMPTY STATE OVERLAY (IF NO LAWYERS CURRENTLY REGISTERED) */}
      {lawyers.length === 0 && (
        <div className="absolute top-20 right-4 z-20 max-w-sm rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-4 shadow-xl pointer-events-auto">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900">
                Jurisdiction Overview Mode
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Displaying official judicial center for <strong>{stateData?.name}</strong>. No advocates are currently listed for the selected district filter.
              </p>
              {selectedDistrict !== "All Districts" && (
                <button
                  type="button"
                  onClick={handleResetView}
                  className="mt-1 text-[11px] font-bold text-blue-900 hover:underline block"
                >
                  Show All Districts in {stateData?.name} →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
