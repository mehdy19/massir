import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, ArrowRight, Clock, CheckCircle, XCircle, Car, Palmtree } from "lucide-react";
import ReportLostItemDialog from "@/components/ReportLostItemDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "قيد المراجعة", variant: "secondary" as const, icon: Clock };
    case "found":
      return { label: "تم العثور عليها", variant: "default" as const, icon: CheckCircle };
    case "not_found":
      return { label: "لم يتم العثور عليها", variant: "destructive" as const, icon: XCircle };
    case "resolved":
      return { label: "تم الحل", variant: "outline" as const, icon: CheckCircle };
    default:
      return { label: status, variant: "secondary" as const, icon: Clock };
  }
};

const LostItems = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tripBookings, setTripBookings] = useState<any[]>([]);
  const [adBookings, setAdBookings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!user) return;
    try {
      const [tripsRes, adsRes, reportsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select(`*, trips (*, profiles:driver_id (full_name))`)
          .eq("user_id", user.id)
          .neq("status", "cancelled")
          .order("created_at", { ascending: false }),
        supabase
          .from("ad_bookings")
          .select(`*, ads (*, profiles:driver_id (full_name))`)
          .eq("user_id", user.id)
          .neq("status", "cancelled")
          .order("created_at", { ascending: false }),
        supabase
          .from("lost_items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (tripsRes.error) throw tripsRes.error;
      if (adsRes.error) throw adsRes.error;
      if (reportsRes.error) throw reportsRes.error;
      setTripBookings(tripsRes.data || []);
      setAdBookings(adsRes.data || []);
      setReports(reportsRes.data || []);
    } catch (e) {
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center pb-20">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  const totalBookings = tripBookings.length + adBookings.length;

  return (
    <div className="min-h-screen bg-gradient-hero pb-20" dir="rtl">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight className="h-4 w-4 ml-2" />
          رجوع
        </Button>

        <div className="mb-6 flex items-start gap-3">
          <div className="p-3 rounded-full bg-orange-500/10">
            <Package className="h-7 w-7 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">الإبلاغ عن أمتعة مفقودة</h1>
            <p className="text-muted-foreground text-sm mt-1">
              يمكنك الإبلاغ عن أي أمتعة فقدتها في أي من رحلاتك. سيتم إشعار السائق فوراً.
            </p>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="bookings">رحلاتي ({totalBookings})</TabsTrigger>
            <TabsTrigger value="reports">بلاغاتي ({reports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-3">
            {totalBookings === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">لا توجد رحلات محجوزة</p>
                  <Button onClick={() => navigate("/")}>ابحث عن رحلة</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {tripBookings.map((b) => (
                  <Card key={`t-${b.id}`} className="shadow-soft">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-primary" />
                          <CardTitle className="text-base">
                            {b.from_city} → {b.to_city}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">رحلة عادية</Badge>
                      </div>
                      <CardDescription className="text-xs">
                        السائق: {b.trips?.profiles?.full_name || "غير معروف"} •{" "}
                        {b.trips?.departure_time
                          ? new Date(b.trips.departure_time).toLocaleString("ar-DZ", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReportLostItemDialog
                        bookingId={b.id}
                        tripId={b.trips.id}
                        driverId={b.trips.driver_id}
                        tripInfo={`رحلة ${b.from_city} → ${b.to_city}`}
                      />
                    </CardContent>
                  </Card>
                ))}

                {adBookings.map((b) => (
                  <Card key={`a-${b.id}`} className="shadow-soft">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <Palmtree className="h-4 w-4 text-primary" />
                          <CardTitle className="text-base">{b.ads?.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">رحلة سياحية</Badge>
                      </div>
                      <CardDescription className="text-xs">
                        الوجهة: {b.ads?.destination} •{" "}
                        {b.ads?.departure_date
                          ? new Date(b.ads.departure_date).toLocaleDateString("ar-DZ", {
                              dateStyle: "long",
                            })
                          : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReportLostItemDialog
                        bookingId={b.id}
                        tripId={b.ads.id}
                        driverId={b.ads.driver_id}
                        tripInfo={`رحلة "${b.ads?.title}" إلى ${b.ads?.destination}`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-3">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">لم تقم بأي بلاغ بعد</p>
                </CardContent>
              </Card>
            ) : (
              reports.map((r) => {
                const info = getStatusInfo(r.status);
                const Icon = info.icon;
                return (
                  <Card key={r.id} className="shadow-soft">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant={info.variant}>{info.label}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("ar-DZ")}
                        </span>
                      </div>
                      <p className="text-sm">{r.item_description}</p>
                      {r.driver_response && (
                        <div className="mt-2 p-2 bg-secondary rounded text-sm">
                          <span className="font-semibold">رد السائق: </span>
                          {r.driver_response}
                        </div>
                      )}
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

export default LostItems;
