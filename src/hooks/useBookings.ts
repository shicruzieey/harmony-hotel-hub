import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
type Guest = Database["public"]["Tables"]["guests"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];

export interface BookingWithDetails extends Booking {
  guest?: Guest;
  room?: Room;
}

export const useBookings = () => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch related guests and rooms
      const guestIds = [...new Set(bookings?.map(b => b.guest_id) || [])];
      const roomIds = [...new Set(bookings?.map(b => b.room_id) || [])];

      const [guestsResult, roomsResult] = await Promise.all([
        supabase.from("guests").select("*").in("id", guestIds),
        supabase.from("rooms").select("*").in("id", roomIds)
      ]);

      const guestsMap = new Map(guestsResult.data?.map(g => [g.id, g]) || []);
      const roomsMap = new Map(roomsResult.data?.map(r => [r.id, r]) || []);

      return bookings?.map(booking => ({
        ...booking,
        guest: guestsMap.get(booking.guest_id),
        room: roomsMap.get(booking.room_id)
      })) as BookingWithDetails[];
    },
  });
};

export const useGuests = () => {
  return useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });
};

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");
      if (error) throw error;
      return data;
    },
  });
};

export const useAvailableRooms = (checkIn: string, checkOut: string) => {
  return useQuery({
    queryKey: ["available-rooms", checkIn, checkOut],
    queryFn: async () => {
      // Get all rooms
      const { data: allRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "available");
      
      if (roomsError) throw roomsError;
      
      // Get bookings that overlap with the requested dates
      const { data: overlappingBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("room_id")
        .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`)
        .neq("status", "cancelled");
      
      if (bookingsError) throw bookingsError;
      
      const bookedRoomIds = new Set(overlappingBookings?.map(b => b.room_id) || []);
      
      return allRooms?.filter(room => !bookedRoomIds.has(room.id)) || [];
    },
    enabled: !!checkIn && !!checkOut,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (booking: BookingInsert) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert(booking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useCreateGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guest: Database["public"]["Tables"]["guests"]["Insert"]) => {
      const { data, error } = await supabase
        .from("guests")
        .insert(guest)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Database["public"]["Enums"]["booking_status"] }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
