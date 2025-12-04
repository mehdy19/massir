import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Clock, Users, X, Navigation, Calendar, Palmtree, Car } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [tripBookings, setTripBookings] = useState<any[]>([]);
  const [adBookings, setAdBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllBookings();
    }
  }, [user]);

  const fetchAllBookings = async () => {
    try {
      // جلب حجوزات الرحلات العادية
      const { data: tripsData, error: tripsError } = await supabase
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

      if (tripsError) throw tripsError;
      setTripBookings(tripsData || []);

      // جلب حجوزات الرحلات السياحية
      const { data: adsData, error: adsError } = await supabase
        .from("ad_bookings")
        .select(`
          *,
          ads (
            *,
            profiles:driver_id (full_name, phone)
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (adsError) throw adsError;
      setAdBookings(adsData || []);
    } catch (error: any) {
      toast.error("حدث خطأ في جلب الحجوزات");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTripBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("تم إلغاء الحجز بنجاح");
      fetchAllBookings();
    } catch (error: any) {
      toast.error("حدث خطأ في إلغاء الحجز");
    }
  };

  const handleCancelAdBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("ad_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("تم إلغاء الحجز بنجاح");
      fetchAllBookings();
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
          <p className="text-muted-foreground">جميع حجوزاتك في مكان واحد</p>
        </div>

        <Tabs defaultValue="trips" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="trips" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              الرحلات العادية ({tripBookings.length})
            </TabsTrigger>
            <TabsTrigger value="tourism" className="flex items-center gap-2">
              <Palmtree className="h-4 w-4" />
              الرحلات السياحية ({adBookings.length})
            </TabsTrigger>
          </TabsList>

          {/* حجوزات الرحلات العادية */}
          <TabsContent value="trips" className="space-y-4">
            {tripBookings.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-4">لا توجد حجوزات رحلات عادية</p>
                <Button onClick={() => navigate("/")}>ابحث عن رحلة</Button>
              </div>
            ) : (
              tripBookings.map((booking) => {
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

                      <div className="space-y-2">
                        {!expired && !isCancelled && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate(`/track/${booking.trips.id}`)}
                          >
                            <Navigation className="ml-2 h-4 w-4" />
                            تتبع الرحلة على الخريطة
                          </Button>
                        )}
                        
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
                                <AlertDialogAction onClick={() => handleCancelTripBooking(booking.id)}>
                                  تأكيد الإلغاء
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* حجوزات الرحلات السياحية */}
          <TabsContent value="tourism" className="space-y-4">
            {adBookings.length === 0 ? (
              <div className="text-center py-12">
                <Palmtree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-4">لا توجد حجوزات رحلات سياحية</p>
                <Button onClick={() => navigate("/")}>استكشف الرحلات السياحية</Button>
              </div>
            ) : (
              adBookings.map((booking) => {
                const expired = isExpired(booking.ads.departure_date);
                const isCancelled = booking.status === "cancelled";
                
                return (
                  <Card key={booking.id} className="shadow-soft overflow-hidden">
                    {booking.ads.image_url && (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={booking.ads.image_url} 
                          alt={booking.ads.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl mb-1">
                            {booking.ads.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.ads.destination}
                          </CardDescription>
                          <CardDescription>
                            المنظم: {booking.ads.profiles?.full_name || "غير معروف"}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {booking.ads.price} دج
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isCancelled 
                              ? "bg-destructive text-destructive-foreground"
                              : expired
                              ? "bg-muted text-muted-foreground"
                              : booking.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-700"
                              : "bg-accent text-accent-foreground"
                          }`}>
                            {isCancelled ? "ملغي" : expired ? "منتهية" : booking.status === "pending" ? "قيد الانتظار" : "مؤكد"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(booking.ads.departure_date).toLocaleDateString("ar-DZ", {
                              dateStyle: "long",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.seats_booked} مقعد</span>
                        </div>
                      </div>

                      {booking.ads.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {booking.ads.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate(`/ad/${booking.ads.id}`)}
                        >
                          عرض التفاصيل
                        </Button>
                        
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
                                  سيتم إلغاء حجزك في هذه الرحلة السياحية ولن تتمكن من التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>تراجع</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelAdBooking(booking.id)}>
                                  تأكيد الإلغاء
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBookings;
