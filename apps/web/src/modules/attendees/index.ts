export { AttendeesView } from "./views/attendees-view";
export {
	useAttendees,
	useAttendee,
	useCreateAttendee,
	useUpdateAttendee,
	useDeleteAttendee,
} from "./hooks/use-attendees";
export { attendeesService } from "./services/attendees.service";
export type { AttendeeListQuery, AttendeeRecord } from "./services/attendees.service";
