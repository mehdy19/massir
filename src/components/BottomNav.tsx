import { Home, Calendar, User, Briefcase } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";

const BottomNav = () => {
  const { userRole } = useAuth();

  const userLinks = [
    { to: "/", icon: Home, label: "الرئيسية" },
    { to: "/bookings", icon: Calendar, label: "حجوزاتي" },
  ];

  const driverLinks = [
    { to: "/driver", icon: Home, label: "الرئيسية" },
    { to: "/driver/services", icon: Briefcase, label: "الخدمات" },
  ];

  const links = userRole === "driver" ? driverLinks : userLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-primary/10 shadow-medium z-50 backdrop-blur-sm bg-card/95">
      <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto px-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-lg hover:bg-primary/5"
            activeClassName="text-primary bg-accent/20"
          >
            <Icon className="h-5 w-5 stroke-[2px]" />
            <span className="text-xs font-semibold">{label}</span>
          </NavLink>
        ))}
        <div className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-primary transition-all rounded-lg hover:bg-primary/5 cursor-pointer">
          <NotificationBell />
          <span className="text-xs font-semibold">الإشعارات</span>
        </div>
        <NavLink
          to="/account"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-lg hover:bg-primary/5"
          activeClassName="text-primary bg-accent/20"
        >
          <User className="h-5 w-5 stroke-[2px]" />
          <span className="text-xs font-semibold">حسابي</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
