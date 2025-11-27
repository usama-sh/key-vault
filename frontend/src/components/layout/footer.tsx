import { Keyboard } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Keyboard className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">KeyboardHub</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Your one-stop destination for premium mechanical keyboards. 
              We offer the best selection of keyboards from top brands worldwide.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li><Link href="/products" className="hover:text-primary-600">Products</Link></li>
              <li><Link href="/cart" className="hover:text-primary-600">Cart</Link></li>
              <li><Link href="/orders" className="hover:text-primary-600">Orders</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Email: support@keyboardhub.pk</li>
              <li>Phone: +92 300 1234567</li>
              <li>Karachi, Pakistan</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} KeyboardHub. All rights reserved.</p>
          <p className="mt-2 text-xs">
            💡 Demo Mode Active - All payments are simulated
          </p>
        </div>
      </div>
    </footer>
  );
}
