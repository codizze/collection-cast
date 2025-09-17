import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Stylists from "./pages/Stylists";
import StylistDetail from "./pages/StylistDetail";
import Materials from "./pages/Materials";
import MaterialDetail from "./pages/MaterialDetail";
import Workflow from "./pages/Workflow";
import ProductWorkflow from "./pages/ProductWorkflow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stylists" element={<Stylists />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/production-workflow" element={<ProductWorkflow />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/materials/:id" element={<MaterialDetail />} />
            <Route path="/stylists/:id" element={<StylistDetail />} />
            <Route path="/reports" element={<div className="p-6"><h1 className="text-3xl font-bold">Relatórios</h1><p className="text-muted-foreground">Dashboard de analytics em breve...</p></div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
