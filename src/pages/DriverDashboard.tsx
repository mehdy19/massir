import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, MapPin, Clock, DollarSign, Users, Trash2 } from "lucide-react";
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

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDriverTrips();
      fetchDriverBookings();
    }
  }, [user]);

  const fetchDriverTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("driver_id", user?.id)
        .order("departure_time", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast.error("حدث خطأ في جلب الرحلات");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverBookings = async () => {
    try {
      const { data: tripsData } = await supabase
        .from("trips")
        .select("id")
        .eq("driver_id", user?.id);

      if (!tripsData) return;

      const tripIds = tripsData.map(t => t.id);

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .in("trip_id", tripIds)
        .eq("status", "confirmed");

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error("حدث خطأ في جلب الحجوزات");
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (error) throw error;
      toast.success("تم حذف الرحلة بنجاح");
      fetchDriverTrips();
      fetchDriverBookings();
    } catch (error: any) {
      toast.error("حدث خطأ في حذف الرحلة");
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
            <h1 className="text-4xl font-bold text-foreground mb-2">لوحة القيادة</h1>
            <p className="text-muted-foreground">إدارة رحلاتك</p>
          </div>
          <Button onClick={() => navigate("/driver/new-trip")} size="lg">
            <Plus className="ml-2 h-5 w-5" />
            رحلة جديدة
          </Button>
        </div>

        <div className="space-y-4">
          {trips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">لا توجد رحلات بعد</p>
              <Button onClick={() => navigate("/driver/new-trip")}>
                <Plus className="ml-2 h-4 w-4" />
                إنشاء رحلة جديدة
              </Button>
            </div>
          )}

          {trips.map((trip) => {
            const tripBookings = bookings.filter(b => b.trip_id === trip.id);
            const bookingsByStation = trip.route_cities?.reduce((acc: any, city: string) => {
              acc[city] = tripBookings.filter(b => b.to_city === city);
              return acc;
            }, {});

            return (
              <Card key={trip.id} className="shadow-soft">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {trip.from_city} → {trip.to_city}
                      </CardTitle>
                      <CardDescription>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            trip.status === "active"
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {trip.status === "active" ? "نشط" : trip.status === "completed" ? "مكتمل" : "ملغي"}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{trip.price} دج</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{trip.route_cities?.length || 0} محطة</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {trip.available_seats} / {trip.seats} مقعد متاح
                      </span>
                    </div>
                  </div>

                  {tripBookings.length > 0 && (
                    <div className="p-3 bg-secondary rounded-lg space-y-2">
                      <p className="text-sm font-semibold">الركاب حسب المحطات:</p>
                      {Object.entries(bookingsByStation || {}).map(([city, cityBookings]: [string, any]) => (
                        cityBookings.length > 0 && (
                          <div key={city} className="text-sm">
                            <span className="font-medium">{city}:</span>{" "}
                            <span className="text-muted-foreground">
                              {cityBookings.map((b: any) => b.profiles?.full_name || "غير معروف").join("، ")}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full mt-4">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف الرحلة
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف هذه الرحلة نهائياً وجميع الحجوزات المرتبطة بها. لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>تراجع</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTrip(trip.id)}>
                          تأكيد الحذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
