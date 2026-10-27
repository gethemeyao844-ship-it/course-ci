import { AppProvider, useApp } from '@/context';
import { AuthPage } from '@/pages/AuthPage';
import { ClientLayout } from '@/components/ClientLayout';
import { ClientHome } from '@/pages/ClientHome';
import { ErrandPage } from '@/pages/ErrandPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { RestaurantsPage } from '@/pages/RestaurantsPage';
import { ParcelPage } from '@/pages/ParcelPage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { SupplyListsPage } from '@/pages/SupplyListsPage';
import { PromotionsPage } from '@/pages/PromotionsPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { PaymentHistoryPage } from '@/pages/PaymentHistoryPage';
import { DriverApplicationPage } from '@/pages/DriverApplicationPage';
import { MerchantSetupPage } from '@/pages/MerchantSetupPage';
import { AdminPayments } from '@/pages/AdminPayments';
import { AdminShops } from '@/pages/AdminShops';
import { AdminDriverApps } from '@/pages/AdminDriverApps';
import { WalletPage } from '@/pages/WalletPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { AddressesPage } from '@/pages/AddressesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { HelpPage } from '@/pages/HelpPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DriverLayout } from '@/components/DriverLayout';
import { DriverHome } from '@/pages/DriverHome';
import { DriverHistory } from '@/pages/DriverHistory';
import { DriverProfile } from '@/pages/DriverProfile';
import { MerchantLayout } from '@/components/MerchantLayout';
import { MerchantHome } from '@/pages/MerchantHome';
import { MerchantProducts } from '@/pages/MerchantProducts';
import { MerchantOrders } from '@/pages/MerchantOrders';
import { MerchantProfile } from '@/pages/MerchantProfile';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminHome } from '@/pages/AdminHome';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import {
  AdminProducts, AdminCategories, AdminMerchants, AdminDrivers,
  AdminPromotions, AdminZones, AdminClaims, AdminAccounts,
} from '@/pages/AdminPages';

function Router() {
  const { isLoggedIn, user, page } = useApp();

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  const role = user?.role;

  if (role === 'admin') {
    let content;
    switch (page) {
      case 'admin-home': content = <AdminHome />; break;
      case 'admin-products': content = <AdminProducts />; break;
      case 'admin-categories': content = <AdminCategories />; break;
      case 'admin-merchants': content = <AdminMerchants />; break;
      case 'admin-drivers': content = <AdminDrivers />; break;
      case 'admin-promotions': content = <AdminPromotions />; break;
      case 'admin-zones': content = <AdminZones />; break;
      case 'admin-claims': content = <AdminClaims />; break;
      case 'admin-accounts': content = <AdminAccounts />; break;
      case 'admin-payments': content = <AdminPayments />; break;
      case 'admin-shops': content = <AdminShops />; break;
      case 'admin-driver-apps': content = <AdminDriverApps />; break;
      default: content = <AdminHome />;
    }
    return <AdminLayout>{content}</AdminLayout>;
  }

  if (role === 'driver') {
    let content;
    switch (page) {
      case 'driver-home': content = <DriverHome />; break;
      case 'driver-history': content = <DriverHistory />; break;
      case 'driver-profile': content = <DriverProfile />; break;
      case 'driver-application': content = <DriverApplicationPage />; break;
      case 'driver-wallet': content = <WalletPage />; break;
      default: content = <DriverHome />;
    }
    return <DriverLayout>{content}</DriverLayout>;
  }

  if (role === 'merchant') {
    let content;
    switch (page) {
      case 'merchant-home': content = <MerchantHome />; break;
      case 'merchant-products': content = <MerchantProducts />; break;
      case 'merchant-orders': content = <MerchantOrders />; break;
      case 'merchant-profile': content = <MerchantProfile />; break;
      case 'merchant-setup': content = <MerchantSetupPage />; break;
      case 'merchant-wallet': content = <WalletPage />; break;
      default: content = <MerchantHome />;
    }
    return <MerchantLayout>{content}</MerchantLayout>;
  }

  // Client role (default)
  let content;
  switch (page) {
    case 'home': content = <ClientHome />; break;
    case 'errand': content = <ErrandPage />; break;
    case 'products': content = <ProductsPage />; break;
    case 'restaurants': content = <RestaurantsPage />; break;
    case 'parcel': content = <ParcelPage />; break;
    case 'marketplace': content = <MarketplacePage />; break;
    case 'supply-lists': content = <SupplyListsPage />; break;
    case 'promotions': content = <PromotionsPage />; break;
    case 'checkout': content = <CheckoutPage />; break;
    case 'payment-history': content = <PaymentHistoryPage />; break;
    case 'orders': content = <OrdersPage />; break;
    case 'order-detail': content = <OrderDetailPage />; break;
    case 'profile': content = <ProfilePage />; break;
    case 'messages': content = <MessagesPage />; break;
    case 'addresses': content = <AddressesPage />; break;
    case 'payments': content = <PaymentsPage />; break;
    case 'help': content = <HelpPage />; break;
    case 'settings': content = <SettingsPage />; break;
    case 'wallet': content = <WalletPage />; break;
    default: content = <ClientHome />;
  }
  return <ClientLayout>{content}</ClientLayout>;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <PWAInstallBanner />
    </AppProvider>
  );
}
