import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Coffee, 
  UtensilsCrossed, 
  Wine, 
  Sparkles, 
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Search
} from "lucide-react";
import { toast } from "sonner";

const categories = [
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "bar", label: "Bar & Lounge", icon: Wine },
  { id: "cafe", label: "Café", icon: Coffee },
  { id: "spa", label: "Spa & Wellness", icon: Sparkles },
];

const products = [
  { id: 1, name: "Club Sandwich", category: "restaurant", price: 18.50 },
  { id: 2, name: "Caesar Salad", category: "restaurant", price: 14.00 },
  { id: 3, name: "Grilled Salmon", category: "restaurant", price: 32.00 },
  { id: 4, name: "Steak Frites", category: "restaurant", price: 38.00 },
  { id: 5, name: "Craft Beer", category: "bar", price: 8.00 },
  { id: 6, name: "Signature Cocktail", category: "bar", price: 15.00 },
  { id: 7, name: "Wine Glass", category: "bar", price: 12.00 },
  { id: 8, name: "Espresso", category: "cafe", price: 4.50 },
  { id: 9, name: "Cappuccino", category: "cafe", price: 5.50 },
  { id: 10, name: "Pastry Selection", category: "cafe", price: 7.00 },
  { id: 11, name: "Swedish Massage", category: "spa", price: 120.00 },
  { id: 12, name: "Facial Treatment", category: "spa", price: 85.00 },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const POS = () => {
  const [activeCategory, setActiveCategory] = useState("restaurant");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    p => p.category === activeCategory && 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = (method: string) => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    toast.success(`Payment of $${total.toFixed(2)} processed via ${method}`);
    setCart([]);
  };

  return (
    <MainLayout title="Point of Sale" subtitle="Process guest transactions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "secondary"}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activeCategory === cat.id ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="glass-card cursor-pointer hover:border-accent transition-colors"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-secondary rounded-lg mb-3 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="font-medium text-foreground">{product.name}</h3>
                  <p className="text-lg font-semibold text-accent">${product.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <Card className="glass-card h-fit sticky top-24">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Current Order
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Cart is empty
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button 
                className="bg-primary text-primary-foreground"
                onClick={() => handleCheckout("Card")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Card
              </Button>
              <Button 
                variant="secondary"
                onClick={() => handleCheckout("Cash")}
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cash
              </Button>
            </div>
            <Button 
              className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => handleCheckout("Room Charge")}
            >
              Charge to Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default POS;
