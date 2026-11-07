/**
 * Gold Massage — booking bridge for Google Calendar.
 *
 * Deploy this from the Google account that owns the calendar. It then runs as
 * that account, so no service account, OAuth screen or calendar sharing is
 * needed.
 *
 * HOW TO DEPLOY
 *   1. script.google.com -> New project
 *   2. Replace everything with this file, then set CALENDAR_ID and TOKEN below
 *   3. Deploy -> New deployment -> type: Web app
 *        Execute as:        Me
 *        Who has access:    Anyone
 *   4. Copy the /exec URL and put it in Vercel as GOOGLE_APPS_SCRIPT_URL
 *      (and the same TOKEN as GOOGLE_APPS_SCRIPT_TOKEN)
 */

var CALENDAR_ID = 'primary';          // or a specific calendar address
var TOKEN = '';                       // leave blank to accept any token
var BUSINESS = 'GOLD MASSAGE';        // shown at the front of every event title
var LOCATION = "Carrer de Cannes 27, Local 3, 07600 S'Arenal, Mallorca";

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (TOKEN && p.token !== TOKEN) return reply({ ok: false, error: 'bad token' });

  var cal = CalendarApp.getCalendarById(CALENDAR_ID) || CalendarApp.getDefaultCalendar();

  if (p.action === 'ping') {
    return reply({ ok: true, business: BUSINESS, calendar: cal.getName() });
  }

  if (p.action === 'status') {
    var found = findByRef(cal, p.booking_id);
    if (!found) return reply({ ok: false, error: 'not found' });
    found.setTitle(BUSINESS + ' · ' + prefix(p.status) + ' · ' + stripPrefix(found.getTitle()));
    return reply({ ok: true, id: found.getId() });
  }

  // default: create
  var start = isoDate(p.date, p.start_time);
  var end = isoDate(p.date, p.end_time);
  var who = p.people && Number(p.people) > 1
    ? p.customer_name + ' (' + p.people + 'p)'
    : p.customer_name;

  var ev = cal.createEvent(BUSINESS + ' · ' + prefix(p.status) + ' · ' + p.service + ' · ' + who, start, end, {
    location: LOCATION,
    description: [
      'Cliente: ' + p.customer_name,
      'Teléfono: ' + p.customer_phone,
      'Personas: ' + (p.people || '1'),
      p.price ? 'Total orientativo: €' + p.price : '',
      p.notes ? 'Notas: ' + p.notes : '',
      'Referencia: ' + p.booking_id,
      '',
      BUSINESS + ' — ' + LOCATION
    ].filter(String).join('\n')
  });
  ev.setTag('ref', p.booking_id);
  return reply({ ok: true, id: ev.getId(), ref: p.booking_id });
}

function doGet() {
  return reply({ ok: true, hint: 'POST to this URL' });
}

function findByRef(cal, ref) {
  if (!ref) return null;
  var from = new Date(Date.now() - 30 * 864e5);
  var to = new Date(Date.now() + 365 * 864e5);
  var events = cal.getEvents(from, to);
  for (var i = 0; i < events.length; i++) {
    if (events[i].getTag('ref') === ref) return events[i];
  }
  return null;
}

function prefix(status) {
  if (status === 'confirmed') return 'CONFIRMADA';
  if (status === 'declined') return 'RECHAZADA';
  return 'PENDIENTE';
}

function stripPrefix(title) {
  return String(title)
    .replace(new RegExp('^' + BUSINESS + '\\s·\\s'), '')
    .replace(/^(PENDIENTE|CONFIRMADA|RECHAZADA)\s·\s/, '');
}

function isoDate(date, time) {
  var d = date.split('-'), t = time.split(':');
  return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), Number(t[0]), Number(t[1]), 0);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
