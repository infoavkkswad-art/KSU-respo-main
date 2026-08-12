import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTop, WhatsAppButton } from '@/components/Floating';
import { CartProvider } from '@/context/CartContext';
import { OrderProvider } from '@/context/OrderContext';

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Shop = lazy(() => import('@/pages/Shop'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const TrackOrder = lazy(() => import('@/pages/TrackOrder'));
const Business = lazy(() => import('@/pages/Business'));
const BulkOrders = lazy(() => import('@/pages/BulkOrders'));
const Distributor = lazy(() => import('@/pages/Distributor'));
const Manufacturing = lazy(() => import('@/pages/Manufacturing'));
const WorkWithUs = lazy(() => import('@/pages/WorkWithUs'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Reviews = lazy(() => import('@/pages/Reviews'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogDetail = lazy(() => import('@/pages/BlogDetail'));
const Media = lazy(() => import('@/pages/Media'));
const Contact = lazy(() => import('@/pages/Contact'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Policies = lazy(() => import('@/pages/Policies'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="container-max container-px py-20 text-center">
      <h1 className="text-6xl font-serif font-bold text-brand-red/20 mb-4">404</h1>
      <h2 className="text-2xl font-serif font-bold text-brand-brown mb-2">Page not found</h2>
      <p className="text-brand-brown/60 mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="btn-primary">Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <OrderProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/business" element={<Business />} />
                  <Route path="/bulk-orders" element={<BulkOrders />} />
                  <Route path="/distributor" element={<Distributor />} />
                  <Route path="/manufacturing" element={<Manufacturing />} />
                  <Route path="/work-with-us" element={<WorkWithUs />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        </OrderProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
