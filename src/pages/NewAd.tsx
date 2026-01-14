import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowRight, Clock } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

const NewAd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    destination: "",
    price: "",
    departure_date: "",
    seats: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    if (!formData.title || !formData.image_url || !formData.destination || !formData.price || !formData.departure_date || !formData.seats) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("ads").insert({
        driver_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim(),
        destination: formData.destination.trim(),
        price: Number(formData.price),
        departure_date: new Date(formData.departure_date).toISOString(),
        seats: Number(formData.seats),
        available_seats: Number(formData.seats),
        phone: formData.phone.trim(),
        status: "pending",
      });

      if (error) throw error;

      toast.success("تم إرسال الإعلان للمراجعة! سيظهر بعد موافقة الإدارة.");
      navigate("/driver/ads");
    } catch (error: any) {
      console.error("Error creating ad:", error);
      toast.error("حدث خطأ في إنشاء الإعلان");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-card shadow-soft"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إعلان سياحي جديد</h1>
            <p className="text-muted-foreground">أضف رحلة سياحية جديدة</p>
          </div>
        </div>

        <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            سيتم مراجعة إعلانك من قبل الإدارة قبل نشره. ستتلقى إشعاراً عند الموافقة.
          </AlertDescription>
        </Alert>

        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الإعلان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: رحلة إلى الساحل الغربي"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>صورة الإعلان *</Label>
                <ImageUpload
                  userId={user?.id || ""}
                  currentImage={formData.image_url}
                  onUpload={(url) => setFormData({ ...formData, image_url: url })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">الوجهة *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="مثال: تيبازة"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الرحلة</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أضف تفاصيل عن الرحلة..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (دج) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">عدد المقاعد *</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departure_date">تاريخ الرحلة *</Label>
                <Input
                  id="departure_date"
                  type="datetime-local"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف للتواصل</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0555123456"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال للمراجعة"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewAd;