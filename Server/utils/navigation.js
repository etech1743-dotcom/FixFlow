
export function openTicketNavigation(ticket) {
  const coordinates = ticket?.location?.geo?.coordinates;

  if (
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    !coordinates.every(Number.isFinite) ||
    coordinates[0] < -180 ||
    coordinates[0] > 180 ||
    coordinates[1] < -90 ||
    coordinates[1] > 90
  ) {
    alert("This ticket does not have valid destination coordinates.");
    return;
  }

  const [longitude, latitude] = coordinates;

  const params = new URLSearchParams({
    api: "1",
    destination: `${latitude},${longitude}`,
    travelmode: "driving",
    dir_action: "navigate",
  });

  window.open(
    `https://www.google.com/maps/dir/?${params.toString()}`,
    "_blank",
    "noopener,noreferrer"
  );
}
