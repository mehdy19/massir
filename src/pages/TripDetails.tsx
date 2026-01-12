import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Clock, DollarSign, Users, ArrowRight, Minus, Plus } from "lucide-react";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [seatsCount, setSeatsCount] = useState(1);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

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

  // Calculate price when fromCity changes
  useEffect(() => {
    if (fromCity && trip?.route_prices) {
      const price = trip.route_prices[fromCity];
      if (price !== undefined) {
        setCurrentPrice(price);
      } else {
        setCurrentPrice(null);
      }
    } else {
      setCurrentPrice(null);
    }
  }, [fromCity, trip]);

  const handleBooking = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (!fromCity || !toCity) {
      toast.error("يجب اختيار محطة الانطلاق والوصول");
      return;
    }

    const fromIndex = trip.route_cities.indexOf(fromCity);
    const toIndex = trip.route_cities.indexOf(toCity);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      toast.error("يجب اختيار محطات صحيحة");
      return;
    }

    if (currentPrice === null) {
      toast.error("لا يوجد سعر محدد لهذه المحطة");
      return;
    }

    if (seatsCount <= 0) {
      toast.error("عدد المقاعد يجب أن يكون أكبر من صفر");
      return;
    }

    if (seatsCount > trip.available_seats) {
      toast.error(`لا يتوفر سوى ${trip.available_seats} مقعد`);
      return;
    }

    setBooking(true);
    try {
      // Use atomic RPC function to prevent race condition
      const { data, error } = await supabase.rpc('book_trip_atomically', {
        trip_id_param: trip.id,
        seats_param: seatsCount,
        user_id_param: user.id,
        from_city_param: fromCity,
        to_city_param: toCity,
        price_param: currentPrice ? currentPrice * seatsCount : 0
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        toast.error(result?.message || "عدد المقاعد المطلوبة غير متاح");
        // Refresh trip data to get current available seats
        fetchTripDetails();
        return;
      }

      toast.success(`تم حجز ${seatsCount} مقعد بنجاح!`);
      navigate("/bookings");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "حدث خطأ في الحجز");
    } finally {
      setBooking(false);
    }
  };

  const incrementSeats = () => {
    if (seatsCount < trip?.available_seats) {
      setSeatsCount(prev => prev + 1);
    }
  };

  const decrementSeats = () => {
    if (seatsCount > 1) {
      setSeatsCount(prev => prev - 1);
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
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="w-full">
                  <p className="font-semibold mb-2">محطات الرحلة</p>
                  <div className="space-y-2">
                    {trip.route_cities?.map((city: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-primary' : 
                            index === trip.route_cities.length - 1 ? 'bg-primary' : 
                            'bg-muted-foreground'
                          }`} />
                          {index < trip.route_cities.length - 1 && (
                            <div className="w-px h-6 bg-muted-foreground ml-1.5" />
                          )}
                        </div>
                        <span className="text-sm">{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">موعد الانطلاق</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.departure_time).toLocaleString("ar-DZ", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">السعر</p>
                    {currentPrice !== null ? (
                      <p className="text-2xl font-bold text-primary">{currentPrice} دج</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">اختر محطة الانطلاق</p>
                    )}
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

            <div className="pt-4 border-t space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-city">من محطة</Label>
                  <Select value={fromCity} onValueChange={setFromCity}>
                    <SelectTrigger id="from-city">
                      <SelectValue placeholder="اختر محطة الانطلاق" />
                    </SelectTrigger>
                    <SelectContent>
                      {trip.route_cities?.slice(0, -1).map((city: string) => {
                        const price = trip.route_prices?.[city];
                        return (
                          <SelectItem key={city} value={city}>
                            {city} {price ? `- ${price} دج` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-city">إلى محطة</Label>
                  <Select value={toCity} onValueChange={setToCity}>
                    <SelectTrigger id="to-city">
                      <SelectValue placeholder="اختر محطة الوصول" />
                    </SelectTrigger>
                    <SelectContent>
                      {trip.route_cities?.map((city: string) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* محدد عدد المقاعد */}
              <div className="space-y-2">
                <Label>عدد المقاعد</Label>
                <div className="flex items-center justify-center gap-4 p-4 bg-secondary rounded-lg">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrementSeats}
                    disabled={seatsCount <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold min-w-[3rem] text-center">{seatsCount}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={incrementSeats}
                    disabled={seatsCount >= trip.available_seats}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {currentPrice !== null && (
                  <p className="text-center text-muted-foreground">
                    الإجمالي: <span className="font-bold text-primary">{currentPrice * seatsCount} دج</span>
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBooking}
                disabled={booking || trip.available_seats === 0 || !fromCity || !toCity}
              >
                {booking ? "جاري الحجز..." : trip.available_seats === 0 ? "الرحلة ممتلئة" : `احجز ${seatsCount} مقعد`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetails;
