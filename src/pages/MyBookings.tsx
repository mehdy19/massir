import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Clock, DollarSign, Users, X } from "lucide-react";
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

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          trips (
            *,
            profiles:driver_id (full_name, phone)
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error("حدث خطأ في جلب الحجوزات");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("تم إلغاء الحجز بنجاح");
      fetchBookings();
    } catch (error: any) {
      toast.error("حدث خطأ في إلغاء الحجز");
    }
  };

  const isExpired = (departureTime: string) => {
    return new Date(departureTime) < new Date();
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">حجوزاتي</h1>
          <p className="text-muted-foreground">جميع رحلاتك المحجوزة</p>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">لا توجد حجوزات</p>
              <Button onClick={() => navigate("/")}>ابحث عن رحلة</Button>
            </div>
          )}

          {bookings.map((booking) => {
            const expired = isExpired(booking.trips.departure_time);
            const isCancelled = booking.status === "cancelled";
            
            return (
              <Card key={booking.id} className="shadow-soft">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {booking.from_city} → {booking.to_city}
                      </CardTitle>
                      <CardDescription>
                        السائق: {booking.trips.profiles?.full_name || "غير معروف"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {booking.trips.price} دج
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isCancelled 
                          ? "bg-destructive text-destructive-foreground"
                          : expired
                          ? "bg-muted text-muted-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}>
                        {isCancelled ? "ملغي" : expired ? "منتهية" : "مؤكد"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-semibold mb-2">محطات الرحلة:</p>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    {booking.trips?.route_cities?.map((city: string, index: number) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 rounded ${
                          city === booking.from_city || city === booking.to_city
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'bg-muted'
                        }`}
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(booking.trips.departure_time).toLocaleString("ar-DZ", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.seats_booked} مقعد</span>
                  </div>
                </div>

                {!expired && !isCancelled && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <X className="ml-2 h-4 w-4" />
                        إلغاء الحجز
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم إلغاء حجزك في هذه الرحلة ولن تتمكن من التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>تراجع</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>
                          تأكيد الإلغاء
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
