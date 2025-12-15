import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Calendar,
  Users,
  BedDouble,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

const bookings = [
  { id: "BK001", guest: "John Smith", email: "john@email.com", room: "Suite 401", roomType: "Suite", checkIn: "Dec 15", checkOut: "Dec 18", guests: 2, status: "Confirmed", total: 850 },
  { id: "BK002", guest: "Maria Garcia", email: "maria@email.com", room: "Room 205", roomType: "Deluxe", checkIn: "Dec 15", checkOut: "Dec 17", guests: 1, status: "Pending", total: 380 },
  { id: "BK003", guest: "Alex Chen", email: "alex@email.com", room: "Suite 502", roomType: "Suite", checkIn: "Dec 16", checkOut: "Dec 20", guests: 3, status: "Confirmed", total: 1200 },
  { id: "BK004", guest: "Emma Wilson", email: "emma@email.com", room: "Room 118", roomType: "Standard", checkIn: "Dec 16", checkOut: "Dec 17", guests: 2, status: "Checked In", total: 150 },
  { id: "BK005", guest: "James Brown", email: "james@email.com", room: "Room 302", roomType: "Deluxe", checkIn: "Dec 17", checkOut: "Dec 21", guests: 2, status: "Confirmed", total: 720 },
  { id: "BK006", guest: "Sophie Miller", email: "sophie@email.com", room: "Suite 601", roomType: "Suite", checkIn: "Dec 18", checkOut: "Dec 22", guests: 4, status: "Pending", total: 1600 },
];

const roomAvailability = [
  { type: "Standard", available: 12, total: 20 },
  { type: "Deluxe", available: 8, total: 15 },
  { type: "Suite", available: 3, total: 10 },
  { type: "Presidential", available: 1, total: 2 },
];

const Bookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = ["All", "Confirmed", "Pending", "Checked In", "Checked Out"];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-success/10 text-success border-success/20";
      case "Pending": return "bg-warning/10 text-warning border-warning/20";
      case "Checked In": return "bg-primary/10 text-primary border-primary/20";
      case "Checked Out": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <MainLayout title="Booking Management" subtitle="Manage reservations and room assignments">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Check-ins"
          value="12"
          change="3 arrivals pending"
          icon={Calendar}
        />
        <StatCard
          title="Today's Check-outs"
          value="8"
          change="2 late checkouts"
          icon={Clock}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Available Rooms"
          value="24"
          change="Out of 47 total"
          icon={BedDouble}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Occupancy Rate"
          value="78%"
          change="+5% vs last week"
          changeType="positive"
          icon={Users}
          iconColor="bg-warning/10 text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? "bg-primary text-primary-foreground" : ""}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Cards */}
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="glass-card hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{booking.guest}</h3>
                          <Badge variant="secondary" className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.email}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-4 h-4 text-muted-foreground" />
                            {booking.room} ({booking.roomType})
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {booking.guests} guests
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{booking.checkIn} → {booking.checkOut}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-semibold text-accent">${booking.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">{booking.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Room Availability Sidebar */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">December 2024</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="p-2 text-muted-foreground font-medium">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <div
                    key={day}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-secondary transition-colors ${
                      day === 15 ? "bg-accent text-accent-foreground font-semibold" : ""
                    } ${[12, 16, 18, 22].includes(day) ? "bg-primary/10 text-primary" : ""}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Room Availability */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Room Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomAvailability.map((room) => (
                <div key={room.type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{room.type}</span>
                    <span className="text-muted-foreground">
                      {room.available}/{room.total} available
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${(room.available / room.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Bookings;
