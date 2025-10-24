import { Building2, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                {t("nav.appName")}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("home.badge")}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t("footer.contact")}</h3>
            <div className="space-y-2">
              <a
                href="mailto:contact@propmanager.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>contact@propmanager.com</span>
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/properties"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.properties")}
              </Link>
              <Link
                to="/maintenance"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.maintenance")}
              </Link>
              <Link
                to="/services"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.services")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} {t("nav.appName")}. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;