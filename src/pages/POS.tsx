import { useState, useMemo } from "react";
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
  Search,
  Loader2,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { usePOSCategories, usePOSProducts, useCreateTransaction, CartItem, ProductWithCategory } from "@/hooks/usePOS";
import { GuestSelectionDialog } from "@/components/pos/GuestSelectionDialog";
import { Database } from "@/integrations/supabase/types";

type Guest = Database["public"]["Tables"]["guests"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

interface BookingWithDetails extends Booking {
  guest?: Guest;
  room?: Room;
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  restaurant: UtensilsCrossed,
  bar: Wine,
  cafe: Coffee,
  spa: Sparkles,
  default: Package,
};

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("restaurant") || name.includes("food")) return categoryIcons.restaurant;
  if (name.includes("bar") || name.includes("drink") || name.includes("lounge")) return categoryIcons.bar;
  if (name.includes("cafe") || name.includes("coffee")) return categoryIcons.cafe;
  if (name.includes("spa") || name.includes("wellness")) return categoryIcons.spa;
  return categoryIcons.default;
};

const POS = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = usePOSCategories();
  const { data: products, isLoading: productsLoading } = usePOSProducts();
  const createTransaction = useCreateTransaction();

  // Set default category when data loads
  useMemo(() => {
    if (categories?.length && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const filteredProducts = useMemo(() => {
    return products?.filter(
      (p) =>
        (!activeCategory || p.category_id === activeCategory) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [products, activeCategory, searchQuery]);

  const addToCart = (product: ProductWithCategory) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = async (method: string, booking?: BookingWithDetails) => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      await createTransaction.mutateAsync({
        transaction: {
          subtotal,
          tax,
          total,
          payment_method: method.toLowerCase(),
          status: "completed",
          guest_id: booking?.guest_id || null,
          booking_id: booking?.id || null,
        },
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      });

      const guestInfo = booking 
        ? ` for ${booking.guest?.first_name} ${booking.guest?.last_name} (Room ${booking.room?.room_number})`
        : "";

      toast.success(`Payment of ₱${total.toFixed(2)} processed via ${method}${guestInfo}`);
      setCart([]);
    } catch (error) {
      toast.error("Failed to process transaction. Please try again.");
    }
  };

  const handleRoomCharge = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setIsGuestDialogOpen(true);
  };

  const handleGuestSelect = (booking: BookingWithDetails) => {
    handleCheckout("Room Charge", booking);
  };

  const isLoading = categoriesLoading || productsLoading;

  return (
    <MainLayout title="Point of Sale" subtitle="Process guest transactions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : categories?.length === 0 ? (
              <p className="text-muted-foreground">No categories available</p>
            ) : (
              categories?.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                return (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "secondary"}
                    className={`flex items-center gap-2 whitespace-nowrap ${
                      activeCategory === cat.id ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </Button>
                );
              })
            )}
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
            {productsLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {products?.length === 0
                  ? "No products available. Add products to the database to get started."
                  : "No products match your search."}
              </div>
            ) : (
              filteredProducts.map((product) => (
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
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                        {product.description}
                      </p>
                    )}
                    <p className="text-lg font-semibold text-accent">
                      ₱{Number(product.price).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cart Section */}
        <Card className="glass-card h-fit sticky top-24">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Current Order
              {cart.length > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              )}
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
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₱{item.price.toFixed(2)} × {item.quantity} = ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center font-medium text-sm">
                        {item.quantity}
                      </span>
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
                <span className="font-medium">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-accent">₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => handleCheckout("Card")}
                disabled={createTransaction.isPending || cart.length === 0}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Card
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleCheckout("Cash")}
                disabled={createTransaction.isPending || cart.length === 0}
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cash
              </Button>
            </div>
            <Button
              className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleRoomCharge}
              disabled={createTransaction.isPending || cart.length === 0}
            >
              {createTransaction.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Charge to Room
            </Button>

            {/* Clear Cart */}
            {cart.length > 0 && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setCart([])}
              >
                Clear Cart
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <GuestSelectionDialog
        open={isGuestDialogOpen}
        onOpenChange={setIsGuestDialogOpen}
        onSelect={handleGuestSelect}
        total={total}
      />
    </MainLayout>
  );
};

export default POS;
