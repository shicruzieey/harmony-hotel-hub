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
  ChevronRight,
  Loader2,
  Eye,
  CheckCircle,
  LogIn,
  LogOut,
  XCircle
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { NewBookingDialog } from "@/components/bookings/NewBookingDialog";
import { BookingDetailsDialog } from "@/components/bookings/BookingDetailsDialog";
import { useBookings, useRooms, useUpdateBookingStatus, BookingWithDetails } from "@/hooks/useBookings";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

const Bookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | BookingStatus>("All");
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { toast } = useToast();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: rooms } = useRooms();
  const updateStatus = useUpdateBookingStatus();

  const statuses: ("All" | BookingStatus)[] = ["All", "confirmed", "pending", "checked_in", "checked_out", "cancelled"];

  const getStatusLabel = (status: BookingStatus) => {
    const labels: Record<BookingStatus, string> = {
      confirmed: "Confirmed",
      pending: "Pending",
      checked_in: "Checked In",
      checked_out: "Checked Out",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const filteredBookings = bookings?.filter((booking: BookingWithDetails) => {
    const guestName = `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`.toLowerCase();
    const matchesSearch = 
      guestName.includes(searchQuery.toLowerCase()) ||
      booking.booking_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "checked_in": return "bg-primary/10 text-primary border-primary/20";
      case "checked_out": return "bg-muted text-muted-foreground";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const handleQuickAction = async (booking: BookingWithDetails, newStatus: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id: booking.id, status: newStatus });
      toast({
        title: "Booking Updated",
        description: `Booking status changed to ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getQuickActions = (booking: BookingWithDetails) => {
    switch (booking.status) {
      case "pending":
        return [
          { status: "confirmed" as BookingStatus, label: "Confirm", icon: CheckCircle, color: "text-success" },
          { status: "cancelled" as BookingStatus, label: "Cancel", icon: XCircle, color: "text-destructive" },
        ];
      case "confirmed":
        return [
          { status: "checked_in" as BookingStatus, label: "Check In", icon: LogIn, color: "text-primary" },
          { status: "cancelled" as BookingStatus, label: "Cancel", icon: XCircle, color: "text-destructive" },
        ];
      case "checked_in":
        return [
          { status: "checked_out" as BookingStatus, label: "Check Out", icon: LogOut, color: "text-accent" },
        ];
      default:
        return [];
    }
  };

  // Calculate stats
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  
  const todayCheckIns = bookings?.filter(b => b.check_in_date === todayStr && b.status !== "cancelled").length || 0;
  const todayCheckOuts = bookings?.filter(b => b.check_out_date === todayStr && b.status !== "cancelled").length || 0;
  const availableRooms = rooms?.filter(r => r.status === "available").length || 0;
  const totalRooms = rooms?.length || 0;
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;

  // Room availability by type
  const roomAvailability = rooms?.reduce((acc, room) => {
    const existing = acc.find(r => r.type === room.room_type);
    if (existing) {
      existing.total += 1;
      if (room.status === "available") existing.available += 1;
    } else {
      acc.push({
        type: room.room_type,
        available: room.status === "available" ? 1 : 0,
        total: 1
      });
    }
    return acc;
  }, [] as { type: string; available: number; total: number }[]) || [];

  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  return (
    <MainLayout title="Booking Management" subtitle="Manage reservations and room assignments">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Check-ins"
          value={todayCheckIns}
          change={`${bookings?.filter(b => b.status === "pending").length || 0} pending`}
          icon={Calendar}
        />
        <StatCard
          title="Today's Check-outs"
          value={todayCheckOuts}
          change={`${bookings?.filter(b => b.status === "checked_in").length || 0} currently in`}
          icon={Clock}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Available Rooms"
          value={availableRooms}
          change={`Out of ${totalRooms} total`}
          icon={BedDouble}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          change={occupancyRate > 70 ? "Good occupancy" : "Room for more"}
          changeType={occupancyRate > 70 ? "positive" : "neutral"}
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
                      {status === "All" ? "All" : getStatusLabel(status as BookingStatus)}
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
                  <Button 
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => setIsNewBookingOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Cards */}
          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {bookings?.length === 0 
                    ? "No bookings yet. Create your first booking to get started."
                    : "No bookings match your search criteria."
                  }
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => {
                const quickActions = getQuickActions(booking);
                return (
                  <Card 
                    key={booking.id} 
                    className="glass-card hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">
                                {booking.guest?.first_name} {booking.guest?.last_name}
                              </h3>
                              <Badge variant="secondary" className={getStatusColor(booking.status)}>
                                {getStatusLabel(booking.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{booking.guest?.email}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="flex items-center gap-1">
                                <BedDouble className="w-4 h-4 text-muted-foreground" />
                                Room {booking.room?.room_number} ({booking.room?.room_type})
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {booking.num_guests} guest{booking.num_guests > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>
                                {format(new Date(booking.check_in_date), "MMM d")} → {format(new Date(booking.check_out_date), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-xl font-semibold text-accent">${Number(booking.total_amount)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{booking.booking_number}</p>
                          </div>
                          
                          {/* Quick Actions */}
                          {quickActions.length > 0 && (
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {quickActions.map((action) => (
                                <Button
                                  key={action.status}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickAction(booking, action.status)}
                                  disabled={updateStatus.isPending}
                                  className={`${action.color} hover:${action.color}`}
                                >
                                  <action.icon className="w-4 h-4 mr-1" />
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Room Availability Sidebar */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">
                  {format(new Date(), "MMMM yyyy")}
                </CardTitle>
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
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const currentDay = new Date().getDate();
                  return (
                    <div
                      key={day}
                      className={`p-2 rounded-lg cursor-pointer hover:bg-secondary transition-colors ${
                        day === currentDay ? "bg-accent text-accent-foreground font-semibold" : ""
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Room Availability */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Room Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomAvailability.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rooms configured yet.</p>
              ) : (
                roomAvailability.map((room) => (
                  <div key={room.type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{room.type}</span>
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
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <NewBookingDialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen} />
      <BookingDetailsDialog 
        booking={selectedBooking} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
      />
    </MainLayout>
  );
};

export default Bookings;
