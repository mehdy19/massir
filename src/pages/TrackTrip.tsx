import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Clock, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import TripMap from "@/components/TripMap";

const TrackTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          profiles:driver_id (full_name, phone)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setTrip(data);
    } catch (error: any) {
      toast.error("حدث خطأ في جلب تفاصيل الرحلة");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/bookings")}
          className="mb-6"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للحجوزات
        </Button>

        <div className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-2xl">
                تتبع الرحلة: {trip.from_city} → {trip.to_city}
              </CardTitle>
              <CardDescription>
                السائق: {trip.profiles?.full_name || "غير معروف"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">موعد الانطلاق</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.departure_time).toLocaleString("ar-DZ", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">محطات الرحلة</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.route_cities?.join(" → ")}
                    </p>
                  </div>
                </div>
              </div>

              {trip.profiles?.phone && (
                <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">للتواصل مع السائق</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {trip.profiles.phone}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>الموقع المباشر</CardTitle>
              <CardDescription>
                تتبع موقع السائق على الخريطة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TripMap
                tripId={trip.id}
                initialLocation={trip.current_location}
                fromCity={trip.from_city}
                toCity={trip.to_city}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackTrip;
