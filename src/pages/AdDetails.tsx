import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Calendar, DollarSign, Users, Phone, ArrowRight } from "lucide-react";

interface Ad {
  id: string;
  driver_id: string;
  title: string;
  description: string;
  image_url: string;
  destination: string;
  price: number;
  departure_date: string;
  seats: number;
  available_seats: number;
  phone: string;
  profiles?: { full_name: string };
}

const AdDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);

  useEffect(() => {
    fetchAdDetails();
  }, [id]);

  const fetchAdDetails = async () => {
    try {
      const { data: adData, error: adError } = await supabase
        .from("ads")
        .select("*")
        .eq("id", id)
        .single();

      if (adError) throw adError;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", adData.driver_id)
        .single();

      setAd({ ...adData, profiles: profileData });
    } catch (error: any) {
      toast.error("حدث خطأ في جلب تفاصيل الإعلان");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user || !ad) return;

    if (seatsToBook > ad.available_seats) {
      toast.error("عدد المقاعد المطلوبة غير متاح");
      return;
    }

    setBooking(true);
    try {
      const { error: bookingError } = await supabase.from("ad_bookings").insert({
        ad_id: ad.id,
        user_id: user.id,
        seats_booked: seatsToBook,
        status: "pending",
      });

      if (bookingError) throw bookingError;

      const { error: updateError } = await supabase
        .from("ads")
        .update({ available_seats: ad.available_seats - seatsToBook })
        .eq("id", ad.id);

      if (updateError) throw updateError;

      toast.success("تم إرسال طلب الحجز بنجاح!");
      navigate("/bookings");
    } catch (error: any) {
      toast.error("حدث خطأ في الحجز");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center pb-20">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center pb-20">
        <p className="text-lg">الإعلان غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="relative h-64 md:h-80">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
            رحلة سياحية
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">{ad.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        <Card className="shadow-medium">
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">الوجهة</p>
                  <p className="font-semibold">{ad.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">التاريخ</p>
                  <p className="font-semibold">
                    {new Date(ad.departure_date).toLocaleDateString("ar-DZ", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">السعر</p>
                  <p className="font-semibold text-primary">{ad.price} دج</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">المقاعد المتاحة</p>
                  <p className="font-semibold">{ad.available_seats} مقعد</p>
                </div>
              </div>
            </div>

            {ad.description && (
              <div>
                <h3 className="font-semibold mb-2">تفاصيل الرحلة</h3>
                <p className="text-muted-foreground">{ad.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">السائق</p>
                <p className="font-semibold">{ad.profiles?.full_name || "غير معروف"}</p>
              </div>
              {ad.phone && (
                <a
                  href={`tel:${ad.phone}`}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                >
                  <Phone className="h-4 w-4" />
                  <span>اتصال</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 shadow-medium">
          <CardHeader>
            <CardTitle>احجز الآن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>عدد المقاعد</Label>
              <Input
                type="number"
                min={1}
                max={ad.available_seats}
                value={seatsToBook}
                onChange={(e) => setSeatsToBook(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="text-muted-foreground">المجموع</span>
              <span className="text-xl font-bold text-primary">
                {ad.price * seatsToBook} دج
              </span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleBooking}
              disabled={booking || ad.available_seats === 0}
            >
              {booking ? "جاري الحجز..." : "تأكيد الحجز"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdDetails;