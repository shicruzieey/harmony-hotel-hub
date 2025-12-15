import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User,
  BedDouble,
  Calendar,
  Mail,
  Phone,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateBookingStatus, BookingWithDetails } from "@/hooks/useBookings";
import { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface BookingDetailsDialogProps {
  booking: BookingWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; nextActions: { status: BookingStatus; label: string; icon: React.ElementType; variant: "default" | "destructive" | "outline" | "secondary" }[] }> = {
  pending: {
    label: "Pending",
    color: "bg-warning/10 text-warning border-warning/20",
    nextActions: [
      { status: "confirmed", label: "Confirm Booking", icon: CheckCircle, variant: "default" },
      { status: "cancelled", label: "Cancel Booking", icon: XCircle, variant: "destructive" },
    ],
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-success/10 text-success border-success/20",
    nextActions: [
      { status: "checked_in", label: "Check In Guest", icon: LogIn, variant: "default" },
      { status: "cancelled", label: "Cancel Booking", icon: XCircle, variant: "destructive" },
    ],
  },
  checked_in: {
    label: "Checked In",
    color: "bg-primary/10 text-primary border-primary/20",
    nextActions: [
      { status: "checked_out", label: "Check Out Guest", icon: LogOut, variant: "default" },
    ],
  },
  checked_out: {
    label: "Checked Out",
    color: "bg-muted text-muted-foreground",
    nextActions: [],
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    nextActions: [],
  },
};

export const BookingDetailsDialog = ({
  booking,
  open,
  onOpenChange,
}: BookingDetailsDialogProps) => {
  const { toast } = useToast();
  const updateStatus = useUpdateBookingStatus();
  const [confirmAction, setConfirmAction] = useState<{ status: BookingStatus; label: string } | null>(null);
  const [notes, setNotes] = useState("");

  if (!booking) return null;

  const config = statusConfig[booking.status];
  const nights = Math.ceil(
    (new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id: booking.id, status: newStatus });
      toast({
        title: "Booking Updated",
        description: `Booking status changed to ${statusConfig[newStatus].label}`,
      });
      setConfirmAction(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-heading text-xl">
                Booking Details
              </DialogTitle>
              <Badge variant="secondary" className={config.color}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{booking.booking_number}</p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Guest Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Guest Information
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {booking.guest?.first_name} {booking.guest?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="font-medium">{booking.guest?.email}</p>
                </div>
                {booking.guest?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </p>
                    <p className="font-medium">{booking.guest?.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> Guests
                  </p>
                  <p className="font-medium">{booking.num_guests} guest(s)</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Room & Stay Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BedDouble className="w-4 h-4" />
                Room & Stay Details
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">
                    Room {booking.room?.room_number} ({booking.room?.room_type})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-medium">Floor {booking.room?.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Check-in
                  </p>
                  <p className="font-medium">
                    {format(new Date(booking.check_in_date), "EEEE, MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Check-out
                  </p>
                  <p className="font-medium">
                    {format(new Date(booking.check_out_date), "EEEE, MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration
                  </p>
                  <p className="font-medium">{nights} night(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Total Amount
                  </p>
                  <p className="font-medium text-accent text-lg">
                    ${Number(booking.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </h3>
                  <p className="text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg">
                    {booking.notes}
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            {config.nextActions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    {config.nextActions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant}
                        onClick={() => setConfirmAction({ status: action.status, label: action.label })}
                        disabled={updateStatus.isPending}
                        className={action.variant === "default" ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                      >
                        {updateStatus.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <action.icon className="w-4 h-4 mr-2" />
                        )}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground pt-4 border-t border-border">
              <p>Created: {format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
              <p>Last updated: {format(new Date(booking.updated_at), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.label.toLowerCase()}?
              {confirmAction?.status === "checked_in" && (
                <span className="block mt-2">
                  The guest will be marked as checked in and the room will be occupied.
                </span>
              )}
              {confirmAction?.status === "checked_out" && (
                <span className="block mt-2">
                  The guest will be checked out and the room will be available for the next guest.
                </span>
              )}
              {confirmAction?.status === "cancelled" && (
                <span className="block mt-2 text-destructive">
                  This action cannot be undone. The booking will be cancelled.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && handleStatusUpdate(confirmAction.status)}
              className={confirmAction?.status === "cancelled" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-accent text-accent-foreground hover:bg-accent/90"}
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
