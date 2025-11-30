import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, Clock, DollarSign, Users, ArrowRight } from "lucide-react";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

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

  const handleBooking = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    setBooking(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        trip_id: trip.id,
        user_id: user.id,
        seats_booked: 1,
      });

      if (error) throw error;

      toast.success("تم الحجز بنجاح!");
      navigate("/bookings");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في الحجز");
    } finally {
      setBooking(false);
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
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للرحلات
        </Button>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-3xl">
              {trip.from_city} → {trip.to_city}
            </CardTitle>
            <CardDescription className="text-lg">
              السائق: {trip.profiles?.full_name || "غير معروف"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">المسار</p>
                    <p className="text-sm text-muted-foreground">
                      من {trip.from_city} إلى {trip.to_city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">موعد الانطلاق</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.departure_time).toLocaleString("ar-DZ", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">السعر</p>
                    <p className="text-2xl font-bold text-primary">{trip.price} دج</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">المقاعد المتاحة</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.available_seats} من {trip.seats} مقعد
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full md:w-auto md:min-w-[200px]"
                size="lg"
                onClick={handleBooking}
                disabled={booking || trip.available_seats === 0}
              >
                {booking ? "جاري الحجز..." : trip.available_seats === 0 ? "الرحلة ممتلئة" : "احجز مقعد"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetails;
