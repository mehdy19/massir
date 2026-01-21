import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import masarLogo from "@/assets/masar-logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "driver">("user");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          if (profile?.role === "driver") {
            navigate("/driver");
          } else {
            navigate("/");
          }
        }
      } else {
        if (!acceptedTerms) {
          toast.error("يجب الموافقة على الشروط والأحكام وسياسة الخصوصية");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast.success("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={masarLogo} alt="مسار" className="h-14" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "مرحباً بك من جديد" : "إنشاء حساب جديد"}
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin ? "أدخل بياناتك للدخول" : "املأ البيانات لإنشاء حساب"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="text-right"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                placeholder="example@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <Label>نوع الحساب</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as "user" | "driver")}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="cursor-pointer font-normal">
                      أنا مسافر
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="driver" id="driver" />
                    <Label htmlFor="driver" className="cursor-pointer font-normal">
                      أنا سائق
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start space-x-2 space-x-reverse">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                  أوافق على{" "}
                  <Link to="/terms-conditions" target="_blank" className="text-primary hover:underline">
                    الشروط والأحكام
                  </Link>
                  {" "}و{" "}
                  <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline">
                    سياسة الخصوصية
                  </Link>
                </Label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || (!isLogin && !acceptedTerms)}>
              {loading ? "جاري التحميل..." : isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAcceptedTerms(false);
                }}
                className="text-primary hover:underline"
              >
                {isLogin ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب؟ تسجيل الدخول"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
