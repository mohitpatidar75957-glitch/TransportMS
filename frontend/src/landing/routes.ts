import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import SolutionsPage from './pages/SolutionsPage';
import PricingPage from './pages/PricingPage';
import CompanyPage from './pages/CompanyPage';
import BookDemoPage from './pages/BookDemoPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true,          Component: HomePage },
      { path: 'product',      Component: ProductPage },
      { path: 'solutions',    Component: SolutionsPage },
      { path: 'pricing',      Component: PricingPage },
      { path: 'company',      Component: CompanyPage },
      { path: 'book-demo',    Component: BookDemoPage },
      { path: '*',            Component: NotFoundPage },
    ],
  },
]);
