import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, CheckCircle, ArrowRight } from "lucide-react";

const DriverServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.description.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from("consultation_requests").insert({
      driver_id: user.id,
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      description: formData.description.trim(),
    });

    setLoading(false);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    setFormData({ fullName: "", phone: "", description: "" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-4 px-4">
        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-4 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">تم إرسال طلبك بنجاح!</h1>
          <p className="text-muted-foreground mb-6">
            سيتم التواصل معك في أقرب وقت ممكن
          </p>
          <Button onClick={() => { setSubmitted(false); setShowForm(false); }}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للخدمات
          </Button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-4 px-4">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setShowForm(false)}
            className="mb-4"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                طلب استشارة
              </CardTitle>
              <CardDescription>
                املأ النموذج التالي وسنتواصل معك في أقرب وقت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="أدخل رقم هاتفك"
                    required
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف المشكل أو الاستشارة</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="اشرح المشكل أو الاستشارة التي تحتاجها..."
                    rows={5}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "جاري الإرسال..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 ml-2" />
                      إرسال الطلب
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-4 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">الخدمات</h1>
        
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowForm(true)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">طلب استشارة</h3>
                <p className="text-sm text-muted-foreground">
                  استشارة في مجال النقل والخدمات
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground rotate-180" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverServices;
