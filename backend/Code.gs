/**
 * 1776 Summit — Form Handler
 * Google Apps Script Web App
 *
 * SETUP:
 * 1. Open script.google.com → New project → paste this file
 * 2. Replace SPREADSHEET_ID below with your Google Sheet's ID
 *    (found in the Sheet URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit)
 * 3. Replace NOTIFICATION_EMAIL with the address to receive submission alerts
 * 4. Click Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL and set it as BACKEND_URL in js/main.js
 */

var SPREADSHEET_ID    = 'YOUR_SPREADSHEET_ID_HERE';
var NOTIFICATION_EMAIL = 'YOUR_EMAIL_HERE';  // set to '' to disable email alerts


// ─── Entry point ────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var params   = e.parameter;
    var formType = params.formType;
    var ss       = SpreadsheetApp.openById(SPREADSHEET_ID);
    var timestamp = Utilities.formatDate(
      new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ss z'
    );

    if (formType === 'Invitation') {
      writeInvitation(ss, params, timestamp);
    } else if (formType === 'Nomination') {
      writeNomination(ss, params, timestamp);
    } else {
      return jsonResponse({ status: 'error', message: 'Unknown form type: ' + formType });
    }

    if (NOTIFICATION_EMAIL) {
      sendNotification(formType, params);
    }

    return jsonResponse({ status: 'ok' });

  } catch (err) {
    Logger.log(err);
    return jsonResponse({ status: 'error', message: err.message });
  }
}


// ─── Writers ────────────────────────────────────────────────────────────────

function writeInvitation(ss, p, timestamp) {
  var sheet = getOrCreateSheet(ss, 'Invitations');
  ensureHeaders(sheet, [
    'Timestamp',
    'Name & Affiliation',
    'Profession',
    'Email',
    'Area of Focus',
    'Why Attend'
  ]);
  sheet.appendRow([
    timestamp,
    p.name       || '',
    p.profession || '',
    p.email      || '',
    p.field      || '',
    p.remarks    || ''
  ]);
}

function writeNomination(ss, p, timestamp) {
  var sheet = getOrCreateSheet(ss, 'Nominations');
  ensureHeaders(sheet, [
    'Timestamp',
    'Nominee Name & Affiliation',
    'Profession',
    'Contact Email',
    'Proposed Topic',
    'Why They Should Speak'
  ]);
  sheet.appendRow([
    timestamp,
    p.nominee    || '',
    p.profession || '',
    p.email      || '',
    p.topic      || '',
    p.case       || ''
  ]);
}


// ─── Email notification ──────────────────────────────────────────────────────

function sendNotification(formType, p) {
  var subject, body;

  if (formType === 'Invitation') {
    subject = '1776 Summit — New Invitation Request';
    body =
      'Name & Affiliation : ' + (p.name       || '—') + '\n' +
      'Profession         : ' + (p.profession || '—') + '\n' +
      'Email              : ' + (p.email      || '—') + '\n' +
      'Area of Focus      : ' + (p.field      || '—') + '\n' +
      'Why Attend         :\n' + (p.remarks   || '—');
  } else {
    subject = '1776 Summit — New Speaker Nomination';
    body =
      'Nominee            : ' + (p.nominee    || '—') + '\n' +
      'Profession         : ' + (p.profession || '—') + '\n' +
      'Contact Email      : ' + (p.email      || '—') + '\n' +
      'Proposed Topic     : ' + (p.topic      || '—') + '\n' +
      'Why They Should Speak:\n' + (p.case    || '—');
  }

  MailApp.sendEmail({
    to:      NOTIFICATION_EMAIL,
    subject: subject,
    body:    body
  });
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#16243E');
    headerRange.setFontColor('#C9B473');
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
