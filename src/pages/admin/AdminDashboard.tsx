import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Calendar, FileText, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profilesRes, tripsRes, bookingsRes, adsRes, consultationsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("trips").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("ads").select("id", { count: "exact", head: true }),
        supabase.from("consultation_requests").select("id", { count: "exact", head: true }),
      ]);

      return {
        users: profilesRes.count || 0,
        trips: tripsRes.count || 0,
        bookings: bookingsRes.count || 0,
        ads: adsRes.count || 0,
        consultations: consultationsRes.count || 0,
      };
    },
    enabled: isAdmin,
  });

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: "المستخدمين",
      value: stats?.users || 0,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-500",
    },
    {
      title: "الرحلات",
      value: stats?.trips || 0,
      icon: Car,
      href: "/admin/trips",
      color: "text-green-500",
    },
    {
      title: "الحجوزات",
      value: stats?.bookings || 0,
      icon: Calendar,
      href: "/admin/bookings",
      color: "text-purple-500",
    },
    {
      title: "الإعلانات",
      value: stats?.ads || 0,
      icon: FileText,
      href: "/admin/ads",
      color: "text-orange-500",
    },
    {
      title: "طلبات الاستشارة",
      value: stats?.consultations || 0,
      icon: MessageSquare,
      href: "/admin/consultations",
      color: "text-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-24" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">لوحة تحكم المشرف</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link to={stat.href} key={stat.title}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إدارة سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Users className="h-5 w-5 text-blue-500" />
                <span>إدارة المستخدمين</span>
              </Link>
              <Link
                to="/admin/trips"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Car className="h-5 w-5 text-green-500" />
                <span>إدارة الرحلات</span>
              </Link>
              <Link
                to="/admin/consultations"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-pink-500" />
                <span>طلبات الاستشارة</span>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الإجراءات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                سيتم عرض آخر الإجراءات هنا
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
