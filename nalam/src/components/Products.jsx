import { useState, useEffect } from "react";
import Card from "./Card";
import Loading from "./Loading";
import "./Products.css";

function Products({ searchQuery = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch("https://nalam-grocery.onrender.com/products")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then((data) => {
      const normalized = data.map((p) => ({
        ...p,
        id: p._id,
        price: p.discountedPrice,
        rating: p.rating ?? 0,
        image: p.image || "/placeholder.png"
      }));
      
        setProducts(normalized);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    }, []);
   

  if (loading) return <Loading />;
  if (error) return <p className="products-status">Error: {error}</p>;

  const filteredProducts =
    searchQuery.trim() === ""
      ? products
      : products.filter((p) => {
          const query = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(query) ||
            (p.description &&
              p.description.toLowerCase().includes(query)) ||
            (p.category &&
              p.category.toLowerCase().includes(query))
          );
        });
  return (
    <>
      {searchQuery && (
        <h2 className="products-title">
          Search Results for "{searchQuery}"
        </h2>
      )}

      <section className="products-section">
        {!searchQuery && (
          <div className="products-header">
            <h2 className="products-title">Featured Products</h2>
            <p className="products-subtitle">
              Fresh groceries delivered to your doorstep
            </p>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <p className="products-status">No products found.</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Products;
