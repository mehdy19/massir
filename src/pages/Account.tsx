import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, LogOut } from "lucide-react";

const Account = () => {
  const { user, userRole, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">حسابي</h1>
          <p className="text-muted-foreground">معلومات حسابك الشخصي</p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-medium">
          <CardHeader>
            <CardTitle>معلومات الحساب</CardTitle>
            <CardDescription>تفاصيل حسابك في مسير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">البريد الإلكتروني</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">نوع الحساب</p>
                <p className="text-sm text-muted-foreground">
                  {userRole === "driver" ? "سائق" : "مسافر"}
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
