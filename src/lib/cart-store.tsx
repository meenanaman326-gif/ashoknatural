import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <Card className="rounded-2xl overflow-hidden shadow-md">
      <CardContent className="p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-xl"
        />

        <div className="mt-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>

          {product.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold">
              ₹{product.price}
            </span>

            <Button onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
