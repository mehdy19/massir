import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AdsSlider from "@/components/AdsSlider";

const CITIES = [
  "الجزائر العاصمة",
  "وهران",
  "قسنطينة",
  "عنابة",
  "تلمسان",
  "باتنة",
  "سطيف",
  "بجاية",
  "تيزي وزو",
  "بسكرة",
];

const UserHome = () => {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("trips")
        .select(`
          *,
          profiles:driver_id (full_name)
        `)
        .eq("status", "active")
        .gt("available_seats", 0)
        .gt("departure_time", new Date().toISOString())
        .order("departure_time", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter trips that pass through both cities in the correct order
      let filteredTrips = data || [];
      
      if (fromCity && toCity) {
        filteredTrips = filteredTrips.filter(trip => {
          const fromIndex = trip.route_cities?.indexOf(fromCity);
          const toIndex = trip.route_cities?.indexOf(toCity);
          return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
        });
      } else if (fromCity) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.route_cities?.includes(fromCity)
        );
      } else if (toCity) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.route_cities?.includes(toCity)
        );
      }

      setTrips(filteredTrips);
    } catch (error: any) {
      toast.error("حدث خطأ في جلب الرحلات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrips();
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">ابحث عن رحلتك</h1>
          <p className="text-muted-foreground">اختر وجهتك واحجز مقعدك بسهولة</p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-foreground">رحلات سياحية مميزة</h2>
          <AdsSlider />
        </div>

        <Card className="mb-8 shadow-medium">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">من مدينة</Label>
                  <Select value={fromCity} onValueChange={setFromCity}>
                    <SelectTrigger id="from">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">إلى مدينة</Label>
                  <Select value={toCity} onValueChange={setToCity}>
                    <SelectTrigger id="to">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Search className="ml-2 h-4 w-4" />
                ابحث عن الرحلات
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {trips.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد رحلات متاحة حالياً</p>
            </div>
          )}

          {trips.map((trip) => (
            <Card key={trip.id} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">
                      {trip.from_city} → {trip.to_city}
                    </CardTitle>
                    <CardDescription>
                      السائق: {trip.profiles?.full_name || "غير معروف"}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {trip.route_prices && Object.keys(trip.route_prices).length > 0 ? (
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {Math.min(...Object.values(trip.route_prices).map(Number))} - {Math.max(...Object.values(trip.route_prices).map(Number))} دج
                        </p>
                        <p className="text-xs text-muted-foreground">حسب المحطة</p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-primary">{trip.price} دج</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(trip.departure_time).toLocaleString("ar-DZ", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{trip.available_seats} مقعد متاح</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                >
                  عرض التفاصيل والحجز
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
