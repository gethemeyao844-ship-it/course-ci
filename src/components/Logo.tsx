import { MapPin, ShoppingCart } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showText?: boolean;
}

export function Logo({ size = 'md', variant = 'dark', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', pin: 16, cart: 14, text: 'text-lg' },
    md: { icon: 'w-11 h-11', pin: 22, cart: 18, text: 'text-2xl' },
    lg: { icon: 'w-14 h-14', pin: 28, cart: 24, text: 'text-3xl' },
  };
  const s = sizes[size];

  const textColor = variant === 'light' ? 'text-white' : 'text-navy-800';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.icon} rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-soft relative`}>
        <div className="relative">
          <MapPin
            size={s.pin}
            className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] fill-white/30"
            strokeWidth={2.5}
          />
          <ShoppingCart
            size={s.cart}
            className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[40%]"
            strokeWidth={2.5}
          />
        </div>
      </div>
      {showText && (
        <span className={`font-extrabold ${s.text} ${textColor} tracking-tight`}>
          Course<span className="text-orange-500">CI</span>
        </span>
      )}
    </div>
  );
}
