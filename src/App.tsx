import { AppProvider, useApp } from '@/context';
import { AuthPage } from '@/pages/AuthPage';
import { ClientLayout } from '@/components/ClientLayout';
import { ClientHome } from '@/pages/ClientHome';
import { ErrandPage } from '@/pages/ErrandPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { RestaurantsPage } from '@/pages/RestaurantsPage';
import { ParcelPage } from '@/pages/ParcelPage';
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

function Router() {
  const { isLoggedIn, user, page } = useApp();

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  const role = user?.role;

  if (role === 'admin') {
    return (
      <AdminLayout>
        <AdminHome />
      </AdminLayout>
    );
  }

  if (role === 'driver') {
    let content;
    switch (page) {
      case 'driver-home': content = <DriverHome />; break;
      case 'driver-history': content = <DriverHistory />; break;
      case 'driver-profile': content = <DriverProfile />; break;
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
    case 'orders': content = <OrdersPage />; break;
    case 'order-detail': content = <OrderDetailPage />; break;
    case 'profile': content = <ProfilePage />; break;
    case 'messages': content = <MessagesPage />; break;
    case 'addresses': content = <AddressesPage />; break;
    case 'payments': content = <PaymentsPage />; break;
    case 'help': content = <HelpPage />; break;
    case 'settings': content = <SettingsPage />; break;
    default: content = <ClientHome />;
  }
  return <ClientLayout>{content}</ClientLayout>;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
