import { MapPin, Bus, Navigation, Package, MessageCircle, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  href?: string;
}

const features: Feature[] = [
  {
    icon: Bus,
    title: "حجز الرحلات",
    description: "احجز مقعدك بسهولة وأمان",
    color: "bg-primary/10 text-primary",
    href: "/",
  },
  {
    icon: Route,
    title: "رحلات متنوعة",
    description: "داخلية، بين الولايات، وسياحية",
    color: "bg-accent/10 text-accent",
    href: "/",
  },
  {
    icon: Navigation,
    title: "تتبع مباشر",
    description: "تابع موقع الحافلة لحظة بلحظة",
    color: "bg-emerald-500/10 text-emerald-600",
    href: "/bookings",
  },
  {
    icon: Package,
    title: "الأمتعة المفقودة",
    description: "بلّغ عن ضياع أمتعتك بسهولة",
    color: "bg-amber-500/10 text-amber-600",
    href: "/lost-items",
  },
  {
    icon: MessageCircle,
    title: "استشارات النقل",
    description: "خدمة استشارية في مجال النقل",
    color: "bg-blue-500/10 text-blue-600",
    href: "/services",
  },
  {
    icon: MapPin,
    title: "تغطية واسعة",
    description: "جميع ولايات وبلديات الجزائر",
    color: "bg-rose-500/10 text-rose-600",
  },
];

const FeaturesShowcase = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {features.map((feature, index) => (
        <button
          key={index}
          type="button"
          onClick={() => feature.href && navigate(feature.href)}
          className="text-right bg-card rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-300 border border-border/50"
        >
          <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
            <feature.icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-foreground text-sm mb-1">
            {feature.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </button>
      ))}
    </div>
  );
};

export default FeaturesShowcase;
