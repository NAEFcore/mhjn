import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink, 
  Compass, 
  Layers, 
  Maximize2,
  Info,
  Phone,
  Clock
} from 'lucide-react';
import { IssuePlace } from '../types';

interface IssueMapProps {
  places: IssuePlace[];
  selectedPlaceId?: string;
  onSelectPlace: (place: IssuePlace) => void;
  className?: string;
}

export const IssueMap: React.FC<IssueMapProps> = ({
  places,
  selectedPlaceId,
  onSelectPlace,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(11);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [centerStart, setCenterStart] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 });
  const [mapType, setMapType] = useState<'standard' | 'humanitarian' | 'topo'>('standard');
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 450 });

  // Calculate bounding box and default center based on places
  useEffect(() => {
    if (!places || places.length === 0) return;

    if (selectedPlaceId) {
      const selected = places.find(p => p.id === selectedPlaceId);
      if (selected) {
        setCenter({ lat: selected.lat, lng: selected.lng });
        setZoom(13);
        return;
      }
    }

    const validPlaces = places.filter(p => p.lat && p.lng);
    if (validPlaces.length === 0) return;

    const avgLat = validPlaces.reduce((acc, p) => acc + p.lat, 0) / validPlaces.length;
    const avgLng = validPlaces.reduce((acc, p) => acc + p.lng, 0) / validPlaces.length;
    
    setCenter({ lat: avgLat, lng: avgLng });

    // Approximate zoom based on span
    const minLat = Math.min(...validPlaces.map(p => p.lat));
    const maxLat = Math.max(...validPlaces.map(p => p.lat));
    const minLng = Math.min(...validPlaces.map(p => p.lng));
    const maxLng = Math.max(...validPlaces.map(p => p.lng));
    const maxDiff = Math.max(maxLat - minLat, maxLng - minLng);

    if (maxDiff > 2.0) {
      setZoom(7);
    } else if (maxDiff > 0.8) {
      setZoom(9);
    } else if (maxDiff > 0.2) {
      setZoom(11);
    } else {
      setZoom(12);
    }
  }, [places, selectedPlaceId]);

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 800,
          height: entry.contentRect.height || 450,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Convert Web Mercator / WGS84 coordinates to screen pixel offsets
  const project = (lat: number, lng: number, zoomLevel: number) => {
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const clampedSinLat = Math.max(-0.9999, Math.min(0.9999, sinLat));
    const x = ((lng + 180) / 360) * 256 * Math.pow(2, zoomLevel);
    const y =
      (0.5 - Math.log((1 + clampedSinLat) / (1 - clampedSinLat)) / (4 * Math.PI)) *
      256 *
      Math.pow(2, zoomLevel);
    return { x, y };
  };

  const centerPixel = project(center.lat, center.lng, zoom);

  const getScreenCoordinates = (lat: number, lng: number) => {
    const pointPixel = project(lat, lng, zoom);
    return {
      x: dimensions.width / 2 + (pointPixel.x - centerPixel.x),
      y: dimensions.height / 2 + (pointPixel.y - centerPixel.y),
    };
  };

  // Convert screen pixel change to lat/lng delta
  const unprojectDelta = (dx: number, dy: number, zoomLevel: number) => {
    const scale = 256 * Math.pow(2, zoomLevel);
    const dLng = (-dx / scale) * 360;
    const dLat = (dy / scale) * 180;
    return { dLat, dLng };
  };

  // Mouse / Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCenterStart({ ...center });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const { dLat, dLng } = unprojectDelta(dx, dy, zoom);
    setCenter({
      lat: Math.max(-80, Math.min(80, centerStart.lat + dLat)),
      lng: Math.max(-180, Math.min(180, centerStart.lng + dLng)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(17, prev + 1));
    } else {
      setZoom((prev) => Math.max(5, prev - 1));
    }
  };

  // Tile URL Generator (OpenStreetMap standard / carto)
  const visibleTiles = useMemo(() => {
    const tileSize = 256;
    const numTilesX = Math.ceil(dimensions.width / tileSize) + 2;
    const numTilesY = Math.ceil(dimensions.height / tileSize) + 2;

    const centerTileX = centerPixel.x / tileSize;
    const centerTileY = centerPixel.y / tileSize;

    const startX = Math.floor(centerTileX - numTilesX / 2);
    const startY = Math.floor(centerTileY - numTilesY / 2);
    const maxTile = Math.pow(2, zoom);

    const tiles = [];
    for (let x = startX; x <= startX + numTilesX; x++) {
      for (let y = startY; y <= startY + numTilesY; y++) {
        if (y >= 0 && y < maxTile) {
          const wrappedX = ((x % maxTile) + maxTile) % maxTile;
          const pixelX = x * tileSize - centerPixel.x + dimensions.width / 2;
          const pixelY = y * tileSize - centerPixel.y + dimensions.height / 2;

          let tileUrl = `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`;
          if (mapType === 'humanitarian') {
            tileUrl = `https://a.tile.openstreetmap.fr/hot/${zoom}/${wrappedX}/${y}.png`;
          }

          tiles.push({
            key: `${zoom}-${wrappedX}-${y}`,
            url: tileUrl,
            left: pixelX,
            top: pixelY,
          });
        }
      }
    }
    return tiles;
  }, [centerPixel, zoom, dimensions, mapType]);

  const activePlace = places.find((p) => p.id === selectedPlaceId);

  // Type Color Helper
  const getBadgeColor = (type: string) => {
    switch (type) {
      case '박물관':
        return 'bg-purple-600 text-white border-purple-500';
      case '미술관':
      case '전시관':
        return 'bg-indigo-600 text-white border-indigo-500';
      case '전승지':
      case '체험관':
        return 'bg-emerald-600 text-white border-emerald-500';
      case '유적지':
      case '고궁':
        return 'bg-amber-600 text-white border-amber-500';
      case '공연장':
        return 'bg-rose-600 text-white border-rose-500';
      default:
        return 'bg-slate-700 text-white border-slate-600';
    }
  };

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg ${className}`}>
      {/* Map Control Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md text-xs font-sans">
        <div className="flex items-center gap-1.5 text-slate-800 font-bold border-r border-slate-200 pr-2.5">
          <Compass className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
          <span className="font-serif-kr">이슈 현장 인터랙티브 맵</span>
        </div>
        <span className="text-[11px] text-slate-500">
          장소 <strong>{places.length}</strong>곳 연계
        </span>
      </div>

      {/* Map Zoom & Layer Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col">
          <button
            onClick={() => setZoom((z) => Math.min(17, z + 1))}
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-100"
            title="지도 확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(5, z - 1))}
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            title="지도 축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            if (places.length > 0) {
              const avgLat = places.reduce((a, b) => a + b.lat, 0) / places.length;
              const avgLng = places.reduce((a, b) => a + b.lng, 0) / places.length;
              setCenter({ lat: avgLat, lng: avgLng });
              setZoom(11);
            }
          }}
          className="p-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-md transition-colors"
          title="초기 위치로 복귀"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[360px] sm:h-[420px] bg-[#e6edf4] overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Render Map Tiles */}
        <div className="absolute inset-0 pointer-events-none">
          {visibleTiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              className="absolute w-[256px] h-[256px] opacity-90 transition-opacity duration-200"
              style={{
                left: `${tile.left}px`,
                top: `${tile.top}px`,
              }}
              draggable={false}
              referrerPolicy="no-referrer"
            />
          ))}
        </div>

        {/* Render Place Markers & Pins */}
        <div className="absolute inset-0 pointer-events-none">
          {places.map((place) => {
            const screen = getScreenCoordinates(place.lat, place.lng);
            const isSelected = place.id === selectedPlaceId;
            const isOutside =
              screen.x < -100 ||
              screen.x > dimensions.width + 100 ||
              screen.y < -100 ||
              screen.y > dimensions.height + 100;

            if (isOutside) return null;

            return (
              <div
                key={place.id}
                style={{
                  transform: `translate(${screen.x}px, ${screen.y}px)`,
                }}
                className="absolute left-0 top-0 pointer-events-auto transition-transform duration-150"
              >
                {/* Marker Pin Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlace(place);
                    setCenter({ lat: place.lat, lng: place.lng });
                  }}
                  className={`-translate-x-1/2 -translate-y-full group flex flex-col items-center focus:outline-none transition-all duration-200 ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'
                  }`}
                >
                  {/* Name Pill Badge on Pin */}
                  <div
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shadow-md whitespace-nowrap mb-0.5 flex items-center gap-1 border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-amber-300 border-amber-400 ring-2 ring-amber-400/50'
                        : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400 animate-ping' : 'bg-indigo-600'}`} />
                    <span>{place.name}</span>
                  </div>

                  {/* Marker Icon Pin */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 scale-110'
                        : `${getBadgeColor(place.type)} group-hover:scale-110`
                    }`}
                  >
                    <MapPin className="w-4 h-4 fill-current" />
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-900/60 rounded-full blur-2xs mt-0.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Place Popup Details Card (Inside Map) */}
        {activePlace && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-30 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 p-4 shadow-xl animate-fade-in font-sans">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeColor(activePlace.type)}`}>
                    {activePlace.type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-serif-kr">
                    {activePlace.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{activePlace.address}</span>
                </p>
              </div>
              <button
                onClick={() => onSelectPlace({} as any)}
                className="text-slate-400 hover:text-slate-700 p-1 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              {activePlace.description}
            </p>

            {/* Extra Place Info (Phone / Hours) */}
            {(activePlace.phone || activePlace.openingHours) && (
              <div className="bg-slate-50 rounded-lg p-2 mb-3 text-[11px] text-slate-600 space-y-1">
                {activePlace.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{activePlace.phone}</span>
                  </div>
                )}
                {activePlace.openingHours && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{activePlace.openingHours}</span>
                  </div>
                )}
              </div>
            )}

            {/* Directions & Links Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(activePlace.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 bg-[#fee500] hover:bg-[#fdd835] text-[#3c1e1e] font-bold text-xs rounded-lg text-center transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <Navigation className="w-3 h-3" />
                <span>카카오맵 길찾기</span>
              </a>

              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(activePlace.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 bg-[#03c75a] hover:bg-[#02b351] text-white font-bold text-xs rounded-lg text-center transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <ExternalLink className="w-3 h-3" />
                <span>네이버지도 길찾기</span>
              </a>

              {activePlace.url && (
                <a
                  href={activePlace.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                  title="공식 홈페이지 방문"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>공식 웹</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Map Attribution */}
        <div className="absolute bottom-1 right-2 z-10 text-[9px] text-slate-500 bg-white/70 px-1.5 py-0.5 rounded backdrop-blur-2xs">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
        </div>
      </div>
    </div>
  );
};
