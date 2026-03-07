import { Home, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container py-6 sm:py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="MaintainFlow Logo" className="h-8 sm:h-10 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground">{t("home.badge")}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base sm:text-lg">{t("footer.contact")}</h3>
            <div className="space-y-2">
              <a href="mailto:contact@propmanager.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4 shrink-0" />
                <span>contact@propmanager.com</span>
              </a>
              <a href="tel:+15551234567" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base sm:text-lg">{t("footer.quickLinks")}</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/announcements" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.announcements")}</Link>
              <Link to="/maintenance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.maintenance")}</Link>
              <Link to="/forum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.forum")}</Link>
              <Link to="/polls" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.polls")}</Link>
              <Link to="/documents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.documents")}</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            © {currentYear} MaintainFlow. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
