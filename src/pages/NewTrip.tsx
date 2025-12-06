import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Plus, X } from "lucide-react";
import { WILAYAS } from "@/constants/cities";

const NewTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routeCities, setRouteCities] = useState<string[]>(["", ""]);
  const [routePrices, setRoutePrices] = useState<{ [key: string]: string }>({});
  const [seats, setSeats] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [loading, setLoading] = useState(false);

  const addCity = () => {
    setRouteCities([...routeCities, ""]);
  };

  const removeCity = (index: number) => {
    if (routeCities.length > 2) {
      setRouteCities(routeCities.filter((_, i) => i !== index));
    }
  };

  const updateCity = (index: number, value: string) => {
    const newCities = [...routeCities];
    const oldCity = newCities[index];
    newCities[index] = value;
    setRouteCities(newCities);
    
    // Update prices object - remove old city and add new city
    if (oldCity && oldCity !== value) {
      const newPrices = { ...routePrices };
      delete newPrices[oldCity];
      setRoutePrices(newPrices);
    }
  };

  const updatePrice = (city: string, price: string) => {
    setRoutePrices({
      ...routePrices,
      [city]: price
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const filledCities = routeCities.filter(city => city !== "");
    if (filledCities.length < 2) {
      toast.error("يجب إدخال مدينتين على الأقل");
      setLoading(false);
      return;
    }

    // Validate that all cities (except last) have prices
    const citiesNeedingPrices = filledCities.slice(0, -1);
    const missingPrices = citiesNeedingPrices.filter(city => !routePrices[city] || routePrices[city] === "");
    if (missingPrices.length > 0) {
      toast.error("يجب إدخال سعر لكل محطة");
      setLoading(false);
      return;
    }

    // Convert prices to numbers
    const pricesObject: { [key: string]: number } = {};
    citiesNeedingPrices.forEach(city => {
      pricesObject[city] = parseFloat(routePrices[city]);
    });

    try {
      const { error } = await supabase.from("trips").insert({
        driver_id: user?.id,
        from_city: filledCities[0],
        to_city: filledCities[filledCities.length - 1],
        route_cities: filledCities,
        route_prices: pricesObject,
        price: pricesObject[filledCities[0]], // Keep for backward compatibility
        seats: parseInt(seats),
        available_seats: parseInt(seats),
        departure_time: new Date(departureTime).toISOString(),
        status: "active",
      });

      if (error) throw error;

      toast.success("تم إنشاء الرحلة بنجاح!");
      navigate("/driver");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في إنشاء الرحلة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/driver")}
          className="mb-6"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </Button>

        <Card className="max-w-2xl mx-auto shadow-medium">
          <CardHeader>
            <CardTitle className="text-3xl">إنشاء رحلة جديدة</CardTitle>
            <CardDescription>أدخل تفاصيل الرحلة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>محطات الرحلة (بالترتيب)</Label>
                  <Button type="button" onClick={addCity} variant="outline" size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة محطة
                  </Button>
                </div>
                
                {routeCities.map((city, index) => (
                  <div key={index} className="space-y-3 pb-4 border-b last:border-b-0">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`city-${index}`}>
                          {index === 0 ? "مدينة الانطلاق" : index === routeCities.length - 1 ? "مدينة الوصول" : `محطة ${index}`}
                        </Label>
                        <Select 
                          value={city} 
                          onValueChange={(value) => updateCity(index, value)}
                          required
                        >
                          <SelectTrigger id={`city-${index}`}>
                            <SelectValue placeholder="اختر المدينة" />
                          </SelectTrigger>
                          <SelectContent>
                            {WILAYAS.map((cityOption) => (
                              <SelectItem key={cityOption} value={cityOption}>
                                {cityOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {routeCities.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCity(index)}
                          className="mt-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Show price input for all cities except the last one */}
                    {index < routeCities.length - 1 && city && (
                      <div className="mr-8 space-y-2">
                        <Label htmlFor={`price-${index}`} className="text-sm text-muted-foreground">
                          السعر من {city} إلى {routeCities[routeCities.length - 1] || "الوجهة النهائية"} (دج)
                        </Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          value={routePrices[city] || ""}
                          onChange={(e) => updatePrice(city, e.target.value)}
                          required
                          min="1"
                          placeholder="السعر بالدينار"
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">عدد المقاعد</Label>
                <Input
                  id="seats"
                  type="number"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  required
                  min="1"
                  max="50"
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">وقت الانطلاق</Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "جاري الإنشاء..." : "إنشاء الرحلة"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTrip;
