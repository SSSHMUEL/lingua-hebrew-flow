import React from 'react';
import { PayPalCheckout } from '@/components/PayPalCheckout';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing = () => {
  const { language } = useLanguage();
  const isHebrew = language === 'he';

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {isHebrew ? 'בחר את התוכנית שלך' : 'Choose Your Plan'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isHebrew 
              ? 'התחל ללמוד אנגלית עם TalkFix - גישה מלאה לכל התכונות'
              : 'Start learning English with TalkFix - full access to all features'}
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            {isHebrew ? 'תשלום מאובטח' : 'Secure Payment'}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            {isHebrew ? 'ביטול בכל עת' : 'Cancel Anytime'}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-5 w-5 text-primary" />
            {isHebrew ? '7 ימי ניסיון חינם' : '7 Days Free Trial'}
          </div>
        </div>

        {/* PayPal Checkout Component */}
        <PayPalCheckout onSuccess={() => {
          console.log('Subscription successful!');
        }} />

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isHebrew ? 'חזרה לדף הבית' : 'Back to Home'}
            </Button>
          </Link>
        </div>

        {/* Footer with Legal Links */}
        <footer className="border-t border-white/10 pt-8 mt-12">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                {isHebrew ? 'תנאי שימוש' : 'Terms of Service'}
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                {isHebrew ? 'מדיניות פרטיות' : 'Privacy Policy'}
              </Link>
              <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                {isHebrew ? 'מדיניות החזרים' : 'Refund Policy'}
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} TalkFix. {isHebrew ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Pricing;
