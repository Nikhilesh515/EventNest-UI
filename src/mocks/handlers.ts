import { http, HttpResponse } from "msw";
import type { Event, Rsvp, Tag, User } from "../types";

function envelope<T>(result: T, code = 200) {
  return { code, success: true, message: null, result, errors: null };
}

function failure(code: number, message: string) {
  return { code, success: false, message, result: null, errors: null };
}

export const testUser: User = {
  id: "1",
  name: "Test User",
  displayName: "Test User",
  email: "test@test.com",
  role: "User",
  roleName: "User",
};

export const testOrganizer: User = {
  id: "2",
  name: "Test Organizer",
  displayName: "Test Organizer",
  email: "organizer@test.com",
  role: "Organizer",
  roleName: "Organizer",
};

const futureStart = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000,
).toISOString();
const futureEnd = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
).toISOString();

const techTag: Tag = {
  id: "t1",
  name: "Technology",
  color: "#3b82f6",
  createdAt: "2026-09-01T00:00:00.000Z",
};

export const testEvent: Event = {
  id: "1",
  title: "Tech Meetup",
  description: "A test event",
  location: "Online",
  startsAt: futureStart,
  endsAt: futureEnd,
  capacity: 50,
  goingCount: 12,
  maybeCount: 3,
  organizerId: "2",
  organizerName: "Test Organizer",
  status: "Published",
  visibility: "Public",
  tags: [{ id: techTag.id, name: techTag.name, color: techTag.color }],
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

export const testRsvp: Rsvp = {
  id: "r1",
  eventId: "1",
  userId: "1",
  userName: "Test User",
  status: "Confirmed",
  guestCount: 1,
  notes: null,
  respondedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSession = {
  accessToken: "mock-access-token",
  user: testUser,
};

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    if (body.email === "bad@email.com") {
      return HttpResponse.json(failure(401, "Invalid credentials"), {
        status: 401,
      });
    }
    return HttpResponse.json(envelope(mockSession));
  }),

  http.post("/api/auth/register", () => {
    return HttpResponse.json(envelope(mockSession));
  }),

  http.post("/api/auth/refresh", () => {
    return HttpResponse.json(envelope(mockSession));
  }),

  http.post("/api/auth/logout", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/events", () => {
    return HttpResponse.json(
      envelope({
        items: [testEvent],
        total: 1,
        page: 1,
        size: 10,
        pages: 1,
      }),
    );
  }),

  http.get("/api/events/:eventId", () => {
    return HttpResponse.json(envelope(testEvent));
  }),

  http.post("/api/events", () => {
    return HttpResponse.json(
      envelope(
        {
          ...testEvent,
          id: "new-event",
          title: "New Event",
          status: "Draft",
          goingCount: 0,
          maybeCount: 0,
        },
        201,
      ),
      { status: 201 },
    );
  }),

  http.put("/api/events/:eventId/publish", () => {
    return HttpResponse.json(envelope({ ...testEvent, status: "Published" }));
  }),

  http.get("/api/events/:eventId/rsvps", () => {
    return HttpResponse.json(envelope([testRsvp]));
  }),

  http.post("/api/events/:eventId/rsvps", () => {
    return HttpResponse.json(envelope(testRsvp, 201), { status: 201 });
  }),

  http.get("/api/users/:userId/rsvps", () => {
    return HttpResponse.json(envelope([testRsvp]));
  }),

  http.get("/api/tags", () => {
    return HttpResponse.json(envelope([techTag]));
  }),
];
