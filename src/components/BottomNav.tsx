import { Home, Calendar, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/lib/auth";

const BottomNav = () => {
  const { userRole } = useAuth();

  const userLinks = [
    { to: "/", icon: Home, label: "الرئيسية" },
    { to: "/bookings", icon: Calendar, label: "حجوزاتي" },
    { to: "/account", icon: User, label: "حسابي" },
  ];

  const driverLinks = [
    { to: "/driver", icon: Home, label: "الرئيسية" },
    { to: "/account", icon: User, label: "حسابي" },
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
      </div>
    </nav>
  );
};

export default BottomNav;
