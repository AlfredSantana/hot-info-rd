import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import ArticleList from "./pages/admin/ArticleList.jsx";
import NewArticle from "./pages/admin/NewArticle.jsx";
import EditArticle from "./pages/admin/EditArticle.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import TermsOfUse from "./pages/TermsOfUse.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categoria/:category" element={<CategoryPage />} />
          <Route path="/noticia/:slug" element={<ArticlePage />} />
          <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos-de-uso" element={<TermsOfUse />} />
        </Route>
        <Route path="/buscar" element={<SearchPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ArticleList />} />
          <Route path="nueva-noticia" element={<NewArticle />} />
          <Route path="editar/:id" element={<EditArticle />} />
        </Route>
      </Routes>
    </>
  );
}
