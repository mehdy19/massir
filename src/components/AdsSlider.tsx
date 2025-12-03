import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, DollarSign } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string;
  image_url: string;
  destination: string;
  price: number;
  departure_date: string;
  available_seats: number;
}

const AdsSlider = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("status", "active")
        .gt("available_seats", 0)
        .gt("departure_date", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    if (ads.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }
  }, [ads.length]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, [ads.length, nextSlide]);

  if (loading) {
    return (
      <div className="w-full h-48 bg-secondary rounded-2xl animate-pulse" />
    );
  }

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-medium">
      <div
        className="relative h-48 md:h-64 cursor-pointer group"
        onClick={() => navigate(`/ad/${currentAd.id}`)}
      >
        <img
          src={currentAd.image_url}
          alt={currentAd.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold mb-1">{currentAd.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{currentAd.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{currentAd.price} دج</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(currentAd.departure_date).toLocaleDateString("ar-DZ")}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          رحلة سياحية
        </div>
      </div>

      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdsSlider;