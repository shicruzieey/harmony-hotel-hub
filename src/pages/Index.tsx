import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import { 
  BedDouble, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Package,
  ShoppingCart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const revenueData = [
  { name: "Mon", revenue: 4000, bookings: 24 },
  { name: "Tue", revenue: 3000, bookings: 18 },
  { name: "Wed", revenue: 5000, bookings: 32 },
  { name: "Thu", revenue: 4500, bookings: 28 },
  { name: "Fri", revenue: 6000, bookings: 42 },
  { name: "Sat", revenue: 8000, bookings: 56 },
  { name: "Sun", revenue: 7500, bookings: 48 },
];

const recentBookings = [
  { id: "BK001", guest: "John Smith", room: "Suite 401", checkIn: "Dec 15", status: "Confirmed" },
  { id: "BK002", guest: "Maria Garcia", room: "Room 205", checkIn: "Dec 15", status: "Pending" },
  { id: "BK003", guest: "Alex Chen", room: "Suite 502", checkIn: "Dec 16", status: "Confirmed" },
  { id: "BK004", guest: "Emma Wilson", room: "Room 118", checkIn: "Dec 16", status: "Checked In" },
];

const Index = () => {
  return (
    <MainLayout title="Dashboard" subtitle="Welcome back to Minima Hotel">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="₱45,231"
          change="+12.5% from last week"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Occupancy Rate"
          value="78%"
          change="+5% from yesterday"
          changeType="positive"
          icon={BedDouble}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Active Guests"
          value="142"
          change="23 checking out today"
          changeType="neutral"
          icon={Users}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Pending Bookings"
          value="18"
          change="5 need confirmation"
          changeType="neutral"
          icon={Calendar}
          iconColor="bg-warning/10 text-warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0, 0%, 100%)", 
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(38, 92%, 50%)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Daily Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0, 0%, 100%)", 
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="bookings" fill="hsl(222, 47%, 20%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/pos" className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <div className="p-2 rounded-lg bg-accent/10">
                <ShoppingCart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Point of Sale</p>
                <p className="text-sm text-muted-foreground">Process transactions</p>
              </div>
            </a>
            <a href="/inventory" className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Inventory</p>
                <p className="text-sm text-muted-foreground">Manage stock</p>
              </div>
            </a>
            <a href="/reports" className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Reports</p>
                <p className="text-sm text-muted-foreground">View analytics</p>
              </div>
            </a>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{booking.guest}</p>
                      <p className="text-sm text-muted-foreground">{booking.room} • {booking.checkIn}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "Confirmed" ? "bg-success/10 text-success" :
                    booking.status === "Pending" ? "bg-warning/10 text-warning" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Index;
