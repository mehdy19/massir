import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, CheckCircle, ArrowRight, Clock, CheckCheck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ConsultationRequest {
  id: string;
  full_name: string;
  phone: string;
  description: string;
  status: string;
  created_at: string;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "قيد الانتظار", variant: "secondary" as const, icon: Clock };
    case "in_progress":
      return { label: "قيد المعالجة", variant: "default" as const, icon: Clock };
    case "completed":
      return { label: "مكتمل", variant: "outline" as const, icon: CheckCheck };
    case "cancelled":
      return { label: "ملغى", variant: "destructive" as const, icon: XCircle };
    default:
      return { label: status, variant: "secondary" as const, icon: Clock };
  }
};

const DriverServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    description: "",
  });

  const fetchRequests = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("consultation_requests")
      .select("*")
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoadingRequests(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

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
    fetchRequests();
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

        {/* Previous Requests Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">طلباتي السابقة</h2>
          
          {loadingRequests ? (
            <p className="text-center text-muted-foreground py-4">جاري التحميل...</p>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                لا توجد طلبات سابقة
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), "d MMM yyyy", { locale: ar })}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{request.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverServices;
