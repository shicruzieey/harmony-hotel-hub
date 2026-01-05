import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  BedDouble
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

const revenueData = [
  { month: "Jan", revenue: 42000, bookings: 320, occupancy: 68 },
  { month: "Feb", revenue: 38000, bookings: 290, occupancy: 62 },
  { month: "Mar", revenue: 52000, bookings: 410, occupancy: 75 },
  { month: "Apr", revenue: 48000, bookings: 380, occupancy: 72 },
  { month: "May", revenue: 61000, bookings: 480, occupancy: 82 },
  { month: "Jun", revenue: 72000, bookings: 560, occupancy: 88 },
  { month: "Jul", revenue: 85000, bookings: 650, occupancy: 94 },
  { month: "Aug", revenue: 82000, bookings: 620, occupancy: 92 },
  { month: "Sep", revenue: 68000, bookings: 520, occupancy: 85 },
  { month: "Oct", revenue: 58000, bookings: 450, occupancy: 78 },
  { month: "Nov", revenue: 52000, bookings: 400, occupancy: 72 },
  { month: "Dec", revenue: 65000, bookings: 500, occupancy: 80 },
];

const revenueBySource = [
  { name: "Room Revenue", value: 65, color: "hsl(222, 47%, 20%)" },
  { name: "F&B", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Spa & Wellness", value: 10, color: "hsl(142, 76%, 36%)" },
  { name: "Other Services", value: 5, color: "hsl(215, 16%, 47%)" },
];

const guestDemographics = [
  { segment: "Business", percentage: 45 },
  { segment: "Leisure", percentage: 35 },
  { segment: "Groups", percentage: 15 },
  { segment: "Events", percentage: 5 },
];

const topPerformingRooms = [
  { room: "Presidential Suite", revenue: 28500, occupancy: 92 },
  { room: "Executive Suite", revenue: 22400, occupancy: 88 },
  { room: "Deluxe Ocean View", revenue: 18200, occupancy: 95 },
  { room: "Standard King", revenue: 15800, occupancy: 98 },
  { room: "Standard Twin", revenue: 12400, occupancy: 96 },
];

const Reports = () => {
  const [dateRange, setDateRange] = useState("This Year");
  const ranges = ["This Week", "This Month", "This Quarter", "This Year"];

  return (
    <MainLayout title="Reports & Analytics" subtitle="Comprehensive hotel performance insights">
      {/* Date Range & Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex gap-2">
          {ranges.map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "secondary"}
              size="sm"
              onClick={() => setDateRange(range)}
              className={dateRange === range ? "bg-primary text-primary-foreground" : ""}
            >
              {range}
            </Button>
          ))}
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="₱723,000"
          change="+18.2% vs last year"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Average Daily Rate"
          value="₱185"
          change="+12% vs last year"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Bookings"
          value="5,580"
          change="+8.5% vs last year"
          changeType="positive"
          icon={Calendar}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="RevPAR"
          value="₱148"
          change="+15% vs last year"
          changeType="positive"
          icon={BedDouble}
          iconColor="bg-warning/10 text-warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Revenue & Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="month" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0, 0%, 100%)", 
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(38, 92%, 50%)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Revenue (₱)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="hsl(222, 47%, 20%)" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(222, 47%, 20%)" }}
                  name="Occupancy (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Source */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueBySource}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {revenueBySource.map((source) => (
                <div key={source.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: source.color }}
                    />
                    <span>{source.name}</span>
                  </div>
                  <span className="font-medium">{source.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Guest Demographics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Guest Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={guestDemographics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis type="number" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                <YAxis dataKey="segment" type="category" stroke="hsl(215, 16%, 47%)" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0, 0%, 100%)", 
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="percentage" fill="hsl(222, 47%, 20%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Rooms */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Top Performing Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingRooms.map((room, index) => (
                <div key={room.room} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-foreground">{room.room}</span>
                      <span className="text-sm font-semibold text-accent">₱{room.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${room.occupancy}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{room.occupancy}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Monthly Booking Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" stroke="hsl(215, 16%, 47%)" fontSize={12} />
              <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(0, 0%, 100%)", 
                  border: "1px solid hsl(214, 32%, 91%)",
                  borderRadius: "8px"
                }} 
              />
              <Bar dataKey="bookings" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Reports;
