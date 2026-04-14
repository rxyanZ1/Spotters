/**
 * Spotters – Unit Tests
 * Matches: UT-01-CB through UT-11-CB
 *
 * Setup:
 *   npm install --save-dev jest jest-environment-jsdom
 *   Add to package.json: "jest": { "testEnvironment": "jsdom" }
 *   Run: npx jest spotters.test.js
 */

// ── Stubs for functions not yet implemented ────────────────────────────────
// Replace these with real imports once the functions exist in your codebase.

function verifyLocation(name) {
  if (typeof name === "string" && name.trim().length > 0) return "Location Verified";
  throw new Error("Invalid location");
}

function verifyAdmin(user) {
  if (user && user.name) return "user is verified admin";
  throw new Error("Not an admin");
}

function checkLocationExists(name) {
  const map = ["Subway", "Library", "Engineering Building", "Recreation Centre"];
  return map.some(l => l.toLowerCase() === name.toLowerCase());
}

function addLocationUpdate(update) {
  if (!update || !update.title) throw new Error("Invalid update");
  return "update saved";
}

function getLocationUpdates(location) {
  if (typeof location !== "string" || !location.trim()) return [];
  // Stub: returns a non-empty array to signal updates were returned
  return [{ id: 1, location, message: "stub update" }];
}

function verifyLibrarian(name) {
  if (typeof name === "string" && name.trim().length > 0) return "user is verified librarian";
  throw new Error("Not a librarian");
}

function getRoomAvailability(room) {
  const rooms = { "Room 208": { available: true, size: 20 } };
  const result = rooms[room];
  if (!result) throw new Error("Room not found");
  return result;
}

function getCurrentPosition(x, y) {
  if (typeof x !== "number" || typeof y !== "number") throw new Error("Invalid coords");
  return { x, y };
}

function calculateDistance(from, to) {
  if (!from || !to) throw new Error("Missing locations");
  return { distance: 150, direction: "NE" };
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

const BUILDINGS = [
  { id: "ENG", name: "Engineering Building", category: "engineering",
    departments: ["Engineering & Applied Science", "Electrical Engineering"] },
  { id: "LIB", name: "Library", category: "services",
    departments: ["Library Services", "Research Support"] },
  { id: "REC", name: "Recreation Centre", category: "recreation",
    departments: ["Campus Recreation"] },
];

function getVisible(buildings, activeFilter, searchQuery) {
  return buildings
    .filter(b => {
      const catOk  = activeFilter === "all" || b.category === activeFilter;
      const srchOk = !searchQuery
        || b.name.toLowerCase().includes(searchQuery)
        || b.id.toLowerCase().includes(searchQuery)
        || b.departments.some(d => d.toLowerCase().includes(searchQuery));
      return catOk && srchOk;
    })
    .map(b => b.id);
}

// ══════════════════════════════════════════════════════════════════════════
// UT-01-CB  verifyLocation()  |  "Subway"  →  "Location Verified"
// ══════════════════════════════════════════════════════════════════════════
describe("UT-01-CB | verifyLocation()", () => {
  test('returns "Location Verified" for "Subway"', () => {
    expect(verifyLocation("Subway")).toBe("Location Verified");
  });
  test("throws for an empty string", () => {
    expect(() => verifyLocation("")).toThrow();
  });
  test("throws for a non-string input", () => {
    expect(() => verifyLocation(null)).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-02-CB  verifyAdmin()  |  User("John")  →  "user is verified admin"
// ══════════════════════════════════════════════════════════════════════════
describe('UT-02-CB | verifyAdmin()', () => {
  test('returns "user is verified admin" for User("John")', () => {
    expect(verifyAdmin({ name: "John" })).toBe("user is verified admin");
  });
  test("throws when user object has no name", () => {
    expect(() => verifyAdmin({})).toThrow();
  });
  test("throws for null input", () => {
    expect(() => verifyAdmin(null)).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-03-CB  checkLocationExists()  |  "Subway"  →  location exists on map
// ══════════════════════════════════════════════════════════════════════════
describe("UT-03-CB | checkLocationExists()", () => {
  test('"Subway" exists on the map', () => {
    expect(checkLocationExists("Subway")).toBe(true);
  });
  test("unknown location returns false", () => {
    expect(checkLocationExists("Atlantis")).toBe(false);
  });
  test("check is case-insensitive", () => {
    expect(checkLocationExists("subway")).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-04-TB  addLocationUpdate()  |  "Closure Library"  →  update saved
// ══════════════════════════════════════════════════════════════════════════
describe("UT-04-TB | addLocationUpdate()", () => {
  test('returns "update saved" for a Closure Library update', () => {
    expect(addLocationUpdate({ title: "Closure Library", type: "closure" })).toBe("update saved");
  });
  test("throws when update object has no title", () => {
    expect(() => addLocationUpdate({})).toThrow();
  });
  test("throws for null input", () => {
    expect(() => addLocationUpdate(null)).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-05-CB  getLocationUpdates()  |  "Science"  →  updates returned
// ══════════════════════════════════════════════════════════════════════════
describe("UT-05-CB | getLocationUpdates()", () => {
  test('returns a non-empty array for "Science"', () => {
    const updates = getLocationUpdates("Science");
    expect(Array.isArray(updates)).toBe(true);
    expect(updates.length).toBeGreaterThan(0);
  });
  test("returns empty array for blank location string", () => {
    expect(getLocationUpdates("")).toHaveLength(0);
  });
  test("each update object contains a location field", () => {
    const updates = getLocationUpdates("Science");
    updates.forEach(u => expect(u).toHaveProperty("location"));
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-06-CB  verifyLibrarian()  |  "Jillian S."  →  user is verified librarian
// ══════════════════════════════════════════════════════════════════════════
describe("UT-06-CB | verifyLibrarian()", () => {
  test('"Jillian S." is verified as a librarian', () => {
    expect(verifyLibrarian("Jillian S.")).toBe("user is verified librarian");
  });
  test("throws for an empty name", () => {
    expect(() => verifyLibrarian("")).toThrow();
  });
  test("throws for a non-string input", () => {
    expect(() => verifyLibrarian(42)).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-07-CB  getRoomAvailability()  |  "Room 208"  →  availability and size displayed
// ══════════════════════════════════════════════════════════════════════════
describe("UT-07-CB | getRoomAvailability()", () => {
  test('"Room 208" returns an availability result', () => {
    const result = getRoomAvailability("Room 208");
    expect(result).toHaveProperty("available");
  });
  test('"Room 208" result includes a size field', () => {
    const result = getRoomAvailability("Room 208");
    expect(result).toHaveProperty("size");
    expect(typeof result.size).toBe("number");
  });
  test("throws for an unknown room", () => {
    expect(() => getRoomAvailability("Room 999")).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-08-CB  getCurrentPosition()  |  100, 50  →  current position exists
// ══════════════════════════════════════════════════════════════════════════
describe("UT-08-CB | getCurrentPosition()", () => {
  test("returns a position object for coords 100, 50", () => {
    const pos = getCurrentPosition(100, 50);
    expect(pos).not.toBeNull();
  });
  test("returned position contains correct x coordinate", () => {
    expect(getCurrentPosition(100, 50).x).toBe(100);
  });
  test("returned position contains correct y coordinate", () => {
    expect(getCurrentPosition(100, 50).y).toBe(50);
  });
  test("throws for non-numeric input", () => {
    expect(() => getCurrentPosition("a", "b")).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-09-CB  calculateDistance()  |  "Current & Library"  →  distance and direction calculated
// ══════════════════════════════════════════════════════════════════════════
describe("UT-09-CB | calculateDistance()", () => {
  test("returns a result for Current → Library", () => {
    const result = calculateDistance("Current", "Library");
    expect(result).not.toBeNull();
  });
  test("result includes a numeric distance", () => {
    expect(typeof calculateDistance("Current", "Library").distance).toBe("number");
  });
  test("result includes a direction string", () => {
    expect(typeof calculateDistance("Current", "Library").direction).toBe("string");
  });
  test("throws when either location is missing", () => {
    expect(() => calculateDistance(null, "Library")).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-10-CB  timeAgo()  |  timestamp (3 min ago)  →  "3m ago"
// ══════════════════════════════════════════════════════════════════════════
describe("UT-10-CB | timeAgo()", () => {
  test('returns "3m ago" for a timestamp 3 minutes ago', () => {
    expect(timeAgo(Date.now() - 3 * 60_000)).toBe("3m ago");
  });
  test('returns "just now" for a timestamp under 1 minute ago', () => {
    expect(timeAgo(Date.now() - 30_000)).toBe("just now");
  });
  test('returns hours label for a timestamp 2 hours ago', () => {
    expect(timeAgo(Date.now() - 2 * 3_600_000)).toBe("2h ago");
  });
  test('returns days label for a timestamp 1 day ago', () => {
    expect(timeAgo(Date.now() - 24 * 3_600_000)).toBe("1d ago");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UT-11-CB  getVisible()  |  search="library"  →  Only LIB building returned
// ══════════════════════════════════════════════════════════════════════════
describe("UT-11-CB | getVisible()", () => {
  test('search="library" returns only LIB', () => {
    const ids = getVisible(BUILDINGS, "all", "library");
    expect(ids).toEqual(["LIB"]);
  });
  test("LIB is included in results", () => {
    expect(getVisible(BUILDINGS, "all", "library")).toContain("LIB");
  });
  test("ENG is excluded when searching for library", () => {
    expect(getVisible(BUILDINGS, "all", "library")).not.toContain("ENG");
  });
  test("search with no match returns empty array", () => {
    expect(getVisible(BUILDINGS, "all", "xyzzy")).toHaveLength(0);
  });
});