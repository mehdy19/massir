import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, MapPinOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareLocationButtonProps {
  tripId: string;
  isActive?: boolean;
}

const ShareLocationButton = ({ tripId, isActive = false }: ShareLocationButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startSharingLocation = () => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setIsSharing(true);
    
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        try {
          const { error } = await supabase
            .from("trips")
            .update({ current_location: location })
            .eq("id", tripId);

          if (error) throw error;
        } catch (error: any) {
          console.error("Error updating location:", error);
          toast.error("حدث خطأ في تحديث الموقع");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("تعذر الوصول إلى موقعك");
        setIsSharing(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    setWatchId(id);
    toast.success("تم بدء مشاركة الموقع");
  };

  const stopSharingLocation = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    try {
      const { error } = await supabase
        .from("trips")
        .update({ current_location: null })
        .eq("id", tripId);

      if (error) throw error;
      
      setIsSharing(false);
      toast.success("تم إيقاف مشاركة الموقع");
    } catch (error: any) {
      console.error("Error stopping location:", error);
      toast.error("حدث خطأ في إيقاف المشاركة");
    }
  };

  if (!isActive) {
    return (
      <Button variant="outline" disabled>
        <MapPinOff className="ml-2 h-4 w-4" />
        الرحلة منتهية
      </Button>
    );
  }

  return (
    <Button
      variant={isSharing ? "destructive" : "default"}
      onClick={isSharing ? stopSharingLocation : startSharingLocation}
    >
      {isSharing ? (
        <>
          <MapPinOff className="ml-2 h-4 w-4" />
          إيقاف مشاركة الموقع
        </>
      ) : (
        <>
          <MapPin className="ml-2 h-4 w-4" />
          مشاركة الموقع المباشر
        </>
      )}
    </Button>
  );
};

export default ShareLocationButton;
