import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, MapPin, Calendar, DollarSign, Users, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Ad {
  id: string;
  title: string;
  image_url: string;
  destination: string;
  price: number;
  departure_date: string;
  seats: number;
  available_seats: number;
  status: string;
}

interface AdBooking {
  id: string;
  ad_id: string;
  user_id: string;
  seats_booked: number;
  status: string;
  user_name?: string;
}

const DriverAds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [bookings, setBookings] = useState<Record<string, AdBooking[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAds();
    }
  }, [user]);

  const fetchAds = async () => {
    try {
      const { data: adsData, error: adsError } = await supabase
        .from("ads")
        .select("*")
        .eq("driver_id", user?.id)
        .order("created_at", { ascending: false });

      if (adsError) throw adsError;
      setAds(adsData || []);

      if (adsData && adsData.length > 0) {
        const adIds = adsData.map((ad) => ad.id);
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("ad_bookings")
          .select("*")
          .in("ad_id", adIds);

        if (bookingsError) throw bookingsError;

        if (bookingsData && bookingsData.length > 0) {
          const userIds = [...new Set(bookingsData.map((b) => b.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);

          const profilesMap = new Map(profilesData?.map((p) => [p.id, p.full_name]));

          const bookingsByAd: Record<string, AdBooking[]> = {};
          bookingsData.forEach((booking) => {
            if (!bookingsByAd[booking.ad_id]) {
              bookingsByAd[booking.ad_id] = [];
            }
            bookingsByAd[booking.ad_id].push({
              ...booking,
              user_name: profilesMap.get(booking.user_id) || "غير معروف",
            });
          });
          setBookings(bookingsByAd);
        }
      }
    } catch (error: any) {
      toast.error("حدث خطأ في جلب الإعلانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const { error } = await supabase.from("ads").delete().eq("id", adId);

      if (error) throw error;
      toast.success("تم حذف الإعلان بنجاح");
      fetchAds();
    } catch (error: any) {
      toast.error("حدث خطأ في حذف الإعلان");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center pb-20">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إعلاناتي السياحية</h1>
            <p className="text-muted-foreground">إدارة الرحلات السياحية</p>
          </div>
          <Button onClick={() => navigate("/driver/new-ad")} size="lg">
            <Plus className="ml-2 h-5 w-5" />
            إعلان جديد
          </Button>
        </div>

        <div className="space-y-4">
          {ads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">لا توجد إعلانات بعد</p>
              <Button onClick={() => navigate("/driver/new-ad")}>
                <Plus className="ml-2 h-4 w-4" />
                إنشاء إعلان جديد
              </Button>
            </div>
          )}

          {ads.map((ad) => {
            const adBookings = bookings[ad.id] || [];
            const isExpired = new Date(ad.departure_date) < new Date();

            return (
              <Card key={ad.id} className="shadow-soft overflow-hidden">
                <div className="flex">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-32 h-32 object-cover"
                  />
                  <div className="flex-1">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{ad.title}</CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ad.destination}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isExpired
                              ? "bg-muted text-muted-foreground"
                              : "bg-accent text-accent-foreground"
                          }`}
                        >
                          {isExpired ? "منتهي" : "نشط"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          {ad.price} دج
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(ad.departure_date).toLocaleDateString("ar-DZ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {ad.available_seats}/{ad.seats}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </div>

                {adBookings.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm font-semibold mb-2">
                        الحجوزات ({adBookings.length})
                      </p>
                      <div className="space-y-1">
                        {adBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>{booking.user_name || "غير معروف"}</span>
                            <span className="text-muted-foreground">
                              {booking.seats_booked} مقعد - {booking.status === "pending" ? "معلق" : "مؤكد"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="px-4 pb-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/ad/${ad.id}`)}
                  >
                    <Eye className="ml-2 h-4 w-4" />
                    عرض
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف هذا الإعلان نهائياً وجميع الحجوزات المرتبطة به.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>تراجع</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAd(ad.id)}>
                          تأكيد الحذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DriverAds;